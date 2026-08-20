import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Edit, Save, X } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

interface EditRiskLevelModalProps {
  model: {
    id: number;
    modelName: string;
    department: string;
    riskTier: string;
    aiActStatus: string;
    createdAt: string;
  };
}

const RISK_LEVELS = ["Low", "Medium", "High"];
const AI_ACT_STATUS_OPTIONS = ["Low-Risk", "Medium-Risk", "High-Risk", "Prohibited", "Unregulated"];

const RISK_COLOR_MAP = {
  "High-Risk": "text-red-700 dark:text-red-300",
  "Medium-Risk": "text-yellow-700 dark:text-yellow-300", 
  "Low-Risk": "text-green-700 dark:text-green-300",
  "Prohibited": "text-red-900 dark:text-red-200",
  "Unregulated": "text-gray-700 dark:text-gray-300"
};

export function EditRiskLevelModal({ model }: EditRiskLevelModalProps) {
  const [open, setOpen] = useState(false);
  const [newRiskLevel, setNewRiskLevel] = useState(model.riskTier);
  const [newAiActStatus, setNewAiActStatus] = useState(model.aiActStatus);
  const [comment, setComment] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateRiskMutation = useMutation({
    mutationFn: async (data: { newRiskLevel: string; newAiActStatus: string; comment: string }) => {
      const response = await fetch(`/api/ai-models/${model.id}/risk-level`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update risk level");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Risk Level Updated",
        description: "The model's risk classification has been successfully updated.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/ai-models"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/metrics"] });
      setOpen(false);
      setComment("");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update risk level. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      toast({
        title: "Comment Required",
        description: "Please provide a comment explaining the risk level change.",
        variant: "destructive",
      });
      return;
    }
    updateRiskMutation.mutate({ newRiskLevel, newAiActStatus, comment });
  };

  const resetForm = () => {
    setNewRiskLevel(model.riskTier);
    setNewAiActStatus(model.aiActStatus);
    setComment("");
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (!isOpen) resetForm();
    }}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 w-8 p-0">
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5 text-primary" />
            Edit Risk Classification
          </DialogTitle>
        </DialogHeader>
        
        <motion.form
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          {/* Model Info */}
          <div className="p-3 bg-muted/30 rounded-lg">
            <h4 className="font-medium text-sm">{model.modelName}</h4>
            <p className="text-sm text-muted-foreground">{model.department}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-muted-foreground">Current:</span>
              <Badge 
                variant="outline" 
                className={RISK_COLOR_MAP[model.aiActStatus as keyof typeof RISK_COLOR_MAP]}
              >
                {model.aiActStatus}
              </Badge>
            </div>
          </div>

          {/* Risk Level Selection */}
          <div className="space-y-2">
            <Label htmlFor="risk-level">Risk Tier</Label>
            <Select value={newRiskLevel} onValueChange={setNewRiskLevel}>
              <SelectTrigger>
                <SelectValue placeholder="Select risk level" />
              </SelectTrigger>
              <SelectContent>
                {RISK_LEVELS.map((level) => (
                  <SelectItem key={level} value={level}>
                    {level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* AI Act Status Selection */}
          <div className="space-y-2">
            <Label htmlFor="ai-act-status">AI Act Classification</Label>
            <Select value={newAiActStatus} onValueChange={setNewAiActStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Select AI Act status" />
              </SelectTrigger>
              <SelectContent>
                {AI_ACT_STATUS_OPTIONS.map((status) => (
                  <SelectItem key={status} value={status}>
                    <span className={RISK_COLOR_MAP[status as keyof typeof RISK_COLOR_MAP]}>
                      {status}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <Label htmlFor="comment">
              Comment <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="comment"
              placeholder="Explain the reason for this risk level change..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="min-h-[80px]"
              required
            />
            <p className="text-xs text-muted-foreground">
              This comment will be recorded with timestamp for audit purposes.
            </p>
          </div>

          {/* Preview Changes */}
          {(newRiskLevel !== model.riskTier || newAiActStatus !== model.aiActStatus) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg"
            >
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                Changes Preview:
              </p>
              <div className="flex items-center gap-2 text-sm">
                <Badge variant="outline" className={RISK_COLOR_MAP[model.aiActStatus as keyof typeof RISK_COLOR_MAP]}>
                  {model.aiActStatus}
                </Badge>
                <span className="text-muted-foreground">→</span>
                <Badge variant="outline" className={RISK_COLOR_MAP[newAiActStatus as keyof typeof RISK_COLOR_MAP]}>
                  {newAiActStatus}
                </Badge>
              </div>
            </motion.div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={updateRiskMutation.isPending}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={updateRiskMutation.isPending || !comment.trim()}
            >
              {updateRiskMutation.isPending ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Update Classification
            </Button>
          </div>
        </motion.form>
      </DialogContent>
    </Dialog>
  );
}
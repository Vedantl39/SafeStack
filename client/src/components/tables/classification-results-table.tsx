import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, FileText } from "lucide-react";
import { motion } from "framer-motion";

interface AiModelClassification {
  id: number;
  modelName: string;
  department: string;
  modelOwner: string;
  purpose: string;
  useCaseType: string;
  inputData: string;
  riskTier: string;
  aiActStatus: string;
  legalNotes: string;
  detectedRisks: string[];
  createdAt: string;
  updatedAt: string;
}

interface ClassificationResultsTableProps {
  classifications: AiModelClassification[];
  onDownload: () => void;
}

const STATUS_COLOR_MAP = {
  "High-Risk": "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300",
  "Medium-Risk": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300", 
  "Low-Risk": "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300",
  "Prohibited": "bg-red-200 text-red-900 dark:bg-red-900/40 dark:text-red-200",
  "Unregulated": "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300"
};

const LEGAL_STATUS_MAP = {
  "Pending": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300",
  "Reviewed": "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300",
  "Requires Review": "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300",
  "Compliant": "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300",
  "Non-Compliant": "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300"
};

export function ClassificationResultsTable({ classifications, onDownload }: ClassificationResultsTableProps) {
  const [sortField, setSortField] = useState<keyof AiModelClassification>("modelName");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const sortedClassifications = [...classifications].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    
    if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
    if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  const handleSort = (field: keyof AiModelClassification) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const getLegalStatus = (notes: string) => {
    if (!notes) return "Pending";
    if (notes.toLowerCase().includes("compliant")) return "Compliant";
    if (notes.toLowerCase().includes("review")) return "Requires Review";
    if (notes.toLowerCase().includes("non-compliant")) return "Non-Compliant";
    return "Reviewed";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mt-8"
    >
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-primary" />
            <CardTitle className="text-gray-900 dark:text-white">
              Classification Results ({classifications.length} models)
            </CardTitle>
          </div>
          <Button onClick={onDownload} className="bg-primary hover:bg-primary/90">
            <Download className="w-4 h-4 mr-2" />
            Download Results
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead 
                    className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                    onClick={() => handleSort("modelName")}
                  >
                    Model Name
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                    onClick={() => handleSort("department")}
                  >
                    Department
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                    onClick={() => handleSort("modelOwner")}
                  >
                    Model Owner
                  </TableHead>
                  <TableHead>Purpose</TableHead>
                  <TableHead>Use Case Type</TableHead>
                  <TableHead>Input Data</TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                    onClick={() => handleSort("createdAt")}
                  >
                    Last Updated
                  </TableHead>
                  <TableHead>Legal Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedClassifications.map((classification) => (
                  <TableRow key={classification.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <TableCell className="font-medium text-gray-900 dark:text-white">
                      {classification.modelName}
                    </TableCell>
                    <TableCell className="text-gray-700 dark:text-gray-300">
                      {classification.department}
                    </TableCell>
                    <TableCell className="text-gray-700 dark:text-gray-300">
                      {classification.modelOwner}
                    </TableCell>
                    <TableCell className="text-gray-700 dark:text-gray-300 max-w-xs truncate">
                      {classification.purpose}
                    </TableCell>
                    <TableCell className="text-gray-700 dark:text-gray-300">
                      {classification.useCaseType}
                    </TableCell>
                    <TableCell className="text-gray-700 dark:text-gray-300 max-w-xs truncate">
                      {classification.inputData}
                    </TableCell>
                    <TableCell className="text-gray-700 dark:text-gray-300">
                      {formatDate(classification.updatedAt)}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="secondary" 
                        className={LEGAL_STATUS_MAP[getLegalStatus(classification.legalNotes) as keyof typeof LEGAL_STATUS_MAP]}
                      >
                        {getLegalStatus(classification.legalNotes)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
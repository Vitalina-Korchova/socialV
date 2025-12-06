import React from "react";

import { Plus, User } from "lucide-react";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Button } from "../ui/button";

export default function TopUsers() {
  const topUsers = [
    { name: "Olivia Anderson", role: "Financial Analyst" },
    { name: "Thomas Baker", role: "Project Manager" },
    { name: "Lily Lee", role: "Graphic Designer" },
    { name: "Andrew Harris", role: "Data Scientist" },
  ];
  return (
    <Card className="w-64 h-fit sticky top-26">
      <CardHeader>
        <h3 className="font-bold text-lg">Top Users</h3>
      </CardHeader>
      <CardContent className="space-y-4">
        {topUsers.map((friend, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-gray-600" />
              </div>
              <div>
                <p className="font-semibold text-sm">{friend.name}</p>
                <p className="text-xs text-gray-500">{friend.role}</p>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="h-8 px-3 cursor-pointer"
            >
              <Plus className="w-3 h-3" />
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

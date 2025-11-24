import React from "react";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { User, Home, MessageCircle } from "lucide-react";

export default function CardProfileOptions() {
  return (
    <Card className="w-64 h-fit fixed top-8 left-10">
      <CardHeader className="pb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-base">Robert Fox</h3>
            <Badge variant="secondary" className="text-xs">
              Software Engineer
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-1">
        <Button variant="default" className="w-full justify-start">
          <Home className="w-4 h-4 mr-3" />
          Home
        </Button>

        <Button variant="ghost" className="w-full justify-start">
          <User className="w-4 h-4 mr-3" />
          Profile
        </Button>

        <Button variant="ghost" className="w-full justify-start">
          <MessageCircle className="w-4 h-4 mr-3" />
          Messages
        </Button>
      </CardContent>
    </Card>
  );
}

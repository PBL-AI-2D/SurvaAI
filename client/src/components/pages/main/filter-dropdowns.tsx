"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function FilterDropdowns() {
  return (
    <div className="space-y-3">
      <div>
        <label className="text-sm font-medium text-foreground mb-1 block">
          Gender
        </label>
        <Select defaultValue="all">
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select gender" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="male">Male</SelectItem>
            <SelectItem value="female">Female</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="text-sm font-medium text-foreground mb-1 block">
          Age Range
        </label>
        <Select defaultValue="all">
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select age range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="18-25">18-25 years</SelectItem>
            <SelectItem value="26-35">26-35 years</SelectItem>
            <SelectItem value="36-45">36-45 years</SelectItem>
            <SelectItem value="46-55">46-55 years</SelectItem>
            <SelectItem value="55+">55+ years</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="text-sm font-medium text-foreground mb-1 block">
          Satisfaction
        </label>
        <Select defaultValue="all">
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select satisfaction level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="very-satisfied">Very Satisfied</SelectItem>
            <SelectItem value="satisfied">Satisfied</SelectItem>
            <SelectItem value="neutral">Neutral</SelectItem>
            <SelectItem value="dissatisfied">Dissatisfied</SelectItem>
            <SelectItem value="very-dissatisfied">Very Dissatisfied</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <label className="text-sm font-medium text-foreground mb-1 block">
          Satisfaction Level
        </label>
        <Select defaultValue="all">
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select satisfaction level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

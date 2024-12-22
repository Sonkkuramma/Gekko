// File: app/dashboard/admin/_components/ContentManager.jsx

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import QuestionsManager from './QuestionsManager';
import TopicTestManager from './test-management/TopicTestManager';
import ModuleTestManager from './test-management/ModuleTestManager';
import SectionTestManager from './test-management/SectionTestManager';
import FullLengthTestManager from './test-management/FullLengthTestManager';

const ContentManager = ({ selectedContentType, onContentTypeChange }) => {
  const managers = [
    { value: 'questionsManager', label: 'Questions Manager' },
    { value: 'topicTestManager', label: 'Topic Test Manager' },
    { value: 'moduleTestManager', label: 'Module Test Manager' },
    { value: 'sectionTestManager', label: 'Section Test Manager' },
    { value: 'fullLengthTestManager', label: 'Full Length Test Manager' },
    { value: 'otherTestManager', label: 'Other Test Manager' },
  ];

  const renderManagerContent = () => {
    switch (selectedContentType) {
      case 'questionsManager':
        return <QuestionsManager />;
      case 'topicTestManager':
        return <TopicTestManager />;
      case 'moduleTestManager':
        return <ModuleTestManager />;
      case 'sectionTestManager':
        return <SectionTestManager />;
      case 'fullLengthTestManager':
        return <FullLengthTestManager />;
      case 'otherTestManager':
        return <OtherTestManager />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      <div className="w-full">
        <Select value={selectedContentType} onValueChange={onContentTypeChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a content type" />
          </SelectTrigger>
          <SelectContent>
            {managers.map((manager) => (
              <SelectItem key={manager.value} value={manager.value}>
                {manager.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>
            {managers.find((c) => c.value === selectedContentType)?.label}
          </CardTitle>
        </CardHeader>
        <CardContent>{renderManagerContent()}</CardContent>
      </Card>
    </div>
  );
};

// Placeholder component for other manager
const OtherTestManager = () => <div>Other Test Manager</div>;

export default ContentManager;

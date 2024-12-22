// File: app/dashboard/admin/_components/ContentCreator.jsx

import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import QuestionsCreator from './QuestionsCreator';
import TopicTestCreator from './test-management/TopicTestCreator';
import ModuleTestCreator from './test-management/ModuleTestCreator';
import SectionTestCreator from './test-management/SectionTestCreator';
import FullLengthTestCreator from './test-management/FullLengthTestCreator';

const ContentCreator = ({ selectedContentType, onContentTypeChange }) => {
  const creators = [
    { value: 'questionsCreator', label: 'Questions Creator' },
    { value: 'topicTestCreator', label: 'Topic Test Creator' },
    { value: 'moduleTestCreator', label: 'Module Test Creator' },
    { value: 'sectionTestCreator', label: 'Section Test Creator' },
    { value: 'fullLengthTestCreator', label: 'Full Length Test Creator' },
    { value: 'otherTestCreator', label: 'Other Test Creator' },
  ];

  const renderCreatorContent = () => {
    switch (selectedContentType) {
      case 'questionsCreator':
        return <QuestionsCreator />;
      case 'topicTestCreator':
        return <TopicTestCreator />;
      case 'moduleTestCreator':
        return <ModuleTestCreator />;
      case 'sectionTestCreator':
        return <SectionTestCreator />;
      case 'fullLengthTestCreator':
        return <FullLengthTestCreator />;
      case 'otherTestCreator':
        return <OtherTestCreator />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4 w-full">
      <Select value={selectedContentType} onValueChange={onContentTypeChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a content type" />
        </SelectTrigger>
        <SelectContent>
          {creators.map((creator) => (
            <SelectItem key={creator.value} value={creator.value}>
              {creator.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <div className="w-full">{renderCreatorContent()}</div>
    </div>
  );
};

// Placeholder component for other creator
const OtherTestCreator = () => <div>Other Test Creator</div>;

export default ContentCreator;

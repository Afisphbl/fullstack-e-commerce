import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

interface PagePreviewProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: string;
}

export const PagePreview: React.FC<PagePreviewProps> = ({
  isOpen,
  onClose,
  title,
  content,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Preview: {title}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[70vh] w-full rounded-md border p-6">
          <article className="prose prose-sm max-w-none dark:prose-invert">
            <h1>{title}</h1>
            <div dangerouslySetInnerHTML={{ __html: content }} />
          </article>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

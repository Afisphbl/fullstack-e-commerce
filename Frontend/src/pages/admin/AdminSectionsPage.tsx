import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';
import { Edit, GripVertical, Eye, EyeOff } from 'lucide-react';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Section {
  _id: string;
  name: string;
  type: string;
  isActive: boolean;
  order: number;
  data: any;
}

interface SortableRowProps {
  section: Section;
  onEdit: (section: Section) => void;
  onToggleActive: (section: Section) => void;
}

const SortableRow: React.FC<SortableRowProps> = ({ section, onEdit, onToggleActive }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <TableRow ref={setNodeRef} style={style}>
      <TableCell>
        <div {...attributes} {...listeners} className="cursor-move">
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>
      </TableCell>
      <TableCell className="font-medium">{section.name}</TableCell>
      <TableCell>
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
          {section.type}
        </span>
      </TableCell>
      <TableCell>{section.order}</TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Switch
            checked={section.isActive}
            onCheckedChange={() => onToggleActive(section)}
          />
          {section.isActive ? (
            <Eye className="h-4 w-4 text-green-600" />
          ) : (
            <EyeOff className="h-4 w-4 text-gray-400" />
          )}
        </div>
      </TableCell>
      <TableCell className="text-right">
        <Button variant="ghost" size="sm" onClick={() => onEdit(section)}>
          <Edit className="h-4 w-4" />
        </Button>
      </TableCell>
    </TableRow>
  );
};

const AdminSectionsPage = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [jsonData, setJsonData] = useState('');
  const [localSections, setLocalSections] = useState<Section[]>([]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const { data: sections, isLoading } = useQuery({
    queryKey: ['admin-sections'],
    queryFn: async () => {
      const res = await apiFetch('/api/v1/sections?sort=order');
      return res.data.data as Section[];
    },
    onSuccess: (data) => {
      setLocalSections(data);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Section> }) => {
      return await apiFetch(`/api/v1/sections/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-sections'] });
      queryClient.invalidateQueries({ queryKey: ['sections'] });
      toast.success('Section updated successfully');
      setIsDialogOpen(false);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update section');
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      return await apiFetch(`/api/v1/sections/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ isActive }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-sections'] });
      queryClient.invalidateQueries({ queryKey: ['sections'] });
      toast.success('Section visibility updated');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update section');
    },
  });

  const reorderMutation = useMutation({
    mutationFn: async (sections: Section[]) => {
      // Update order for all sections
      const promises = sections.map((section, index) =>
        apiFetch(`/api/v1/sections/${section._id}`, {
          method: 'PATCH',
          body: JSON.stringify({ order: index + 1 }),
        })
      );
      return Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-sections'] });
      queryClient.invalidateQueries({ queryKey: ['sections'] });
      toast.success('Section order updated');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update order');
      // Revert to original order
      if (sections) setLocalSections(sections);
    },
  });

  const handleEdit = (section: Section) => {
    setEditingSection(section);
    setJsonData(JSON.stringify(section.data, null, 2));
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSection) return;

    try {
      const parsedData = JSON.parse(jsonData);
      updateMutation.mutate({
        id: editingSection._id,
        data: { data: parsedData },
      });
    } catch (error) {
      toast.error('Invalid JSON format');
    }
  };

  const handleToggleActive = (section: Section) => {
    toggleActiveMutation.mutate({
      id: section._id,
      isActive: !section.isActive,
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = localSections.findIndex((s) => s._id === active.id);
      const newIndex = localSections.findIndex((s) => s._id === over.id);

      const newSections = arrayMove(localSections, oldIndex, newIndex);
      setLocalSections(newSections);
      reorderMutation.mutate(newSections);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">
          Homepage Sections
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage homepage layout and section visibility
        </p>
      </div>

      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Order</TableHead>
                <TableHead>Visibility</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <SortableContext
                items={localSections.map((s) => s._id)}
                strategy={verticalListSortingStrategy}
              >
                {localSections.map((section) => (
                  <SortableRow
                    key={section._id}
                    section={section}
                    onEdit={handleEdit}
                    onToggleActive={handleToggleActive}
                  />
                ))}
              </SortableContext>
            </TableBody>
          </Table>
        </DndContext>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Edit Section: {editingSection?.name}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Section Type</Label>
              <p className="text-sm text-muted-foreground">
                {editingSection?.type}
              </p>
            </div>
            <div>
              <Label>Configuration (JSON)</Label>
              <Textarea
                value={jsonData}
                onChange={(e) => setJsonData(e.target.value)}
                className="font-mono text-sm min-h-[400px]"
                placeholder='{"key": "value"}'
              />
              <p className="text-xs text-muted-foreground mt-1">
                Edit the JSON configuration for this section. Be careful with the
                format.
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                Save Changes
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminSectionsPage;

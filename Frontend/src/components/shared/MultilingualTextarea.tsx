import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Control, FieldValues, Path } from 'react-hook-form';

interface MultilingualTextareaProps<T extends FieldValues> {
  name: Path<T>;
  label: string;
  control: Control<T>;
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
  rows?: number;
}

export function MultilingualTextarea<T extends FieldValues>({
  name,
  label,
  control,
  required = false,
  placeholder = '',
  disabled = false,
  rows = 4,
}: MultilingualTextareaProps<T>) {
  return (
    <div className="space-y-3">
      <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
        {label} {required && <span className="text-destructive">*</span>}
      </label>
      
      <div className="space-y-3 border rounded-lg p-4 bg-muted/30">
        {/* Amharic */}
        <FormField
          control={control}
          name={`${name}.am` as Path<T>}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs text-muted-foreground font-normal">
                አማርኛ (Amharic)
              </FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder={placeholder}
                  disabled={disabled}
                  rows={rows}
                  className="font-sans resize-none"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* English */}
        <FormField
          control={control}
          name={`${name}.en` as Path<T>}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs text-muted-foreground font-normal">
                English
              </FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder={placeholder}
                  disabled={disabled}
                  rows={rows}
                  className="resize-none"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Afaan Oromo */}
        <FormField
          control={control}
          name={`${name}.om` as Path<T>}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs text-muted-foreground font-normal">
                Afaan Oromo
              </FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder={placeholder}
                  disabled={disabled}
                  rows={rows}
                  className="resize-none"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}

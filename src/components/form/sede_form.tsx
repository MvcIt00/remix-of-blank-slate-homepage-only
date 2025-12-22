import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus } from "lucide-react";

const sedeSchema = z.object({
  nome_sede: z.string().min(1, "Nome sede richiesto"),
  indirizzo: z.string().optional(),
  citta: z.string().optional(),
  provincia: z.string().optional(),
  cap: z.string().optional(),
  is_legale: z.boolean().default(false),
  is_operativa: z.boolean().default(false),
  is_nave: z.boolean().default(false),
  is_banchina: z.boolean().default(false),
  is_officina: z.boolean().default(false),
});

type SedeFormValues = z.infer<typeof sedeSchema>;

interface SedeFormProps {
  onAddSede: (sede: SedeFormValues) => void;
  isPrimaSede?: boolean;
}

export function SedeForm({ onAddSede, isPrimaSede = false }: SedeFormProps) {
  const form = useForm<SedeFormValues>({
    resolver: zodResolver(sedeSchema),
    defaultValues: {
      nome_sede: "",
      indirizzo: "",
      citta: "",
      provincia: "",
      cap: "",
      is_legale: isPrimaSede ? true : false,
      is_operativa: isPrimaSede ? false : true,
      is_nave: false,
      is_banchina: false,
      is_officina: false,
    },
  });

  function onSubmit(values: SedeFormValues) {
    onAddSede(values);
    form.reset();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="nome_sede"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome Sede *</FormLabel>
              <FormControl>
                <Input placeholder="Sede principale" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="indirizzo"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Indirizzo</FormLabel>
                <FormControl>
                  <Input placeholder="Via Roma 1" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="citta"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Città</FormLabel>
                <FormControl>
                  <Input placeholder="Milano" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="provincia"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Provincia</FormLabel>
                <FormControl>
                  <Input placeholder="MI" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="cap"
            render={({ field }) => (
              <FormItem>
                <FormLabel>CAP</FormLabel>
                <FormControl>
                  <Input placeholder="20100" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-2">
          {isPrimaSede ? (
            <FormField
              control={form.control}
              name="is_operativa"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2 space-y-0">
                  <FormControl>
                    <Checkbox 
                      checked={field.value} 
                      onCheckedChange={(checked) => {
                        field.onChange(checked);
                        // Prima sede: sempre legale, operativa se checked
                        form.setValue("is_legale", true);
                      }}
                    />
                  </FormControl>
                  <FormLabel className="font-normal">Sede Legale e Operativa</FormLabel>
                </FormItem>
              )}
            />
          ) : (
            <>
              <p className="text-sm font-medium">Tipologia</p>
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="is_legale"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <FormLabel className="font-normal">Sede Legale</FormLabel>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="is_operativa"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <FormLabel className="font-normal">Operativa</FormLabel>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="is_nave"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <FormLabel className="font-normal">Nave</FormLabel>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="is_banchina"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <FormLabel className="font-normal">Banchina</FormLabel>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="is_officina"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <FormLabel className="font-normal">Officina</FormLabel>
                    </FormItem>
                  )}
                />
              </div>
            </>
          )}
        </div>

        <Button type="submit" variant="outline" className="w-full gap-2">
          <Plus className="h-4 w-4" />
          Aggiungi Sede
        </Button>
      </form>
    </Form>
  );
}
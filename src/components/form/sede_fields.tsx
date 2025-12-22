import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";

export interface SedeFieldsValues {
  nome_sede: string;
  indirizzo?: string;
  citta?: string;
  provincia?: string;
  cap?: string;
  is_legale: boolean;
  is_operativa: boolean;
  is_nave: boolean;
  is_banchina: boolean;
  is_officina: boolean;
}

interface SedeFieldsProps {
  form: UseFormReturn<any>;
  isPrimaSede?: boolean;
  namePrefix?: string;
}

export function SedeFields({ form, isPrimaSede = false, namePrefix = "" }: SedeFieldsProps) {
  const getFieldName = (field: string) => namePrefix ? `${namePrefix}.${field}` : field;

  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name={getFieldName("nome_sede")}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nome Sede *</FormLabel>
            <FormControl>
              <Input placeholder="Sede principale" {...field} value={field.value || ""} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name={getFieldName("indirizzo")}
          render={({ field }) => (
            <FormItem className="col-span-2">
              <FormLabel>Indirizzo</FormLabel>
              <FormControl>
                <Input placeholder="Via Roma 1" {...field} value={field.value || ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={getFieldName("citta")}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Città</FormLabel>
              <FormControl>
                <Input placeholder="Milano" {...field} value={field.value || ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={getFieldName("provincia")}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Provincia</FormLabel>
              <FormControl>
                <Input placeholder="MI" {...field} value={field.value || ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={getFieldName("cap")}
          render={({ field }) => (
            <FormItem>
              <FormLabel>CAP</FormLabel>
              <FormControl>
                <Input placeholder="20100" {...field} value={field.value || ""} />
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
            name={getFieldName("is_operativa")}
            render={({ field }) => (
              <FormItem className="flex items-center space-x-2 space-y-0">
                <FormControl>
                  <Checkbox 
                    checked={field.value} 
                    onCheckedChange={(checked) => {
                      field.onChange(checked);
                      form.setValue(getFieldName("is_legale"), true);
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
                name={getFieldName("is_legale")}
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
                name={getFieldName("is_operativa")}
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
                name={getFieldName("is_nave")}
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
                name={getFieldName("is_banchina")}
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
                name={getFieldName("is_officina")}
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
    </div>
  );
}

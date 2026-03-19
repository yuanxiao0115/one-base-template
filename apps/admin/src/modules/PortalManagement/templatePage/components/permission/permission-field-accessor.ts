type PermissionFieldMap<TForm extends Record<string, unknown>, TField extends string> = Record<
  TField,
  keyof TForm & string
>;

export interface PermissionFieldAccessor<TField extends string, TUser> {
  getByField: (field: TField) => TUser[];
  setByField: (field: TField, users: TUser[]) => void;
}

export function createPermissionFieldAccessor<
  TForm extends Record<string, unknown>,
  TField extends string,
  TUser
>(
  form: TForm,
  fieldMap: PermissionFieldMap<TForm, TField>
): PermissionFieldAccessor<TField, TUser> {
  function getByField(field: TField): TUser[] {
    const key = fieldMap[field];
    return form[key] as TUser[];
  }

  function setByField(field: TField, users: TUser[]) {
    const key = fieldMap[field];
    (form as Record<string, unknown>)[key] = users;
  }

  return {
    getByField,
    setByField
  };
}

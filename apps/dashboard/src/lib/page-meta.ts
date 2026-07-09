export function pageMeta(title: string, description: string) {
  return {
    meta: [{ title }, { name: "description", content: description }],
  };
}

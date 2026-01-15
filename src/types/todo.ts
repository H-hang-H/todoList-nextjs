export interface EditRecord {
  text: string;
  editedAt: string;
}

export interface TodoItem {
  id: number;
  text: string;
  completed: boolean;
  createdAt: string;
  completedAt?: string;
  editHistory: EditRecord[];
}

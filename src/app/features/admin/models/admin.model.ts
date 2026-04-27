export interface Profile {
  id: string | number;
  name: string;
  description: string;
}

export interface Module {
  id: string | number;
  name: string;
  icon: string;
  is_active: boolean;
}

export interface Option {
  id: string | number;
  module_id: string | number;
  name: string;
  path: string;
}

export interface AdminDataResponse<T> {
  status: string;
  data: T[];
}

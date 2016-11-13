import { CreateHistory, HistoryBeforeUnload } from '../';
export default function useBeforeUnload<T>(createHistory: CreateHistory<T>): CreateHistory<T & HistoryBeforeUnload>;
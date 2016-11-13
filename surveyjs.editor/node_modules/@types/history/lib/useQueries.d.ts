import { CreateHistory, HistoryQueries } from '../';
export default function useQueries<T>(createHistory: CreateHistory<T>): CreateHistory<T & HistoryQueries>;
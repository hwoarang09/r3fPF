export interface Message {
  id: string; // 메시지의 고유 ID
  command: string; // 메시지에 포함된 명령어 또는 내용
  timestamp: number; // 메시지의 타임스탬프 (UNIX 시간 형식)
}

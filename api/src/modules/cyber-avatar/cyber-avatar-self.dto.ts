// Self avatar runtime DTOs (types only; controller reads minimal fields).
export interface CyberAvatarSelfChatRequestDto {
  message?: string;
}

export interface CyberAvatarSelfRebuildRequestDto {
  mode?: string;
}

import { z } from 'zod/v4'

export const usernameSchema = z.string().min(3).max(20).regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')
export const displayNameSchema = z.string().min(1).max(50).optional()
export const emailSchema = z.string().email()
export const passwordSchema = z.string().min(8).max(100)

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  username: usernameSchema,
  displayName: displayNameSchema,
})

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
})

export const profileUpdateSchema = z.object({
  username: usernameSchema.optional(),
  display_name: displayNameSchema,
  avatar_url: z.string().url().optional().nullable(),
})

export const scoreSubmissionSchema = z.object({
  sessionId: z.string().uuid(),
  score: z.number().int().min(0).max(999999),
  accuracy: z.number().min(0).max(100).optional(),
  completionTime: z.number().min(0).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
})

export const gameSessionSchema = z.object({
  gameId: z.string().uuid(),
  challengeId: z.string().uuid().optional(),
})

export const friendRequestSchema = z.object({
  addresseeId: z.string().uuid(),
})

export const friendChallengeSchema = z.object({
  gameId: z.string().uuid(),
  opponentId: z.string().uuid().optional(),
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>
export type ScoreSubmissionInput = z.infer<typeof scoreSubmissionSchema>

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Settings, User, Bell, Shield, AlertTriangle, Save, Loader2,
  LogOut, Trash2, Lock, Eye, EyeOff, CheckCircle2, XCircle,
} from 'lucide-react'
import { cn } from 'cn'

import { useAuthStore } from '@/stores/auth-store'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import {
  Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter, DialogClose,
} from '@/components/ui/dialog'

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.4 },
  }),
}

function Toast({ message, type }: { message: string; type: 'success' | 'error' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={cn(
        'fixed top-4 right-4 z-50 flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium shadow-lg',
        type === 'success' ? 'bg-[#22C55E] text-white' : 'bg-red-500 text-white'
      )}
    >
      {type === 'success' ? <CheckCircle2 className="size-4" /> : <XCircle className="size-4" />}
      {message}
    </motion.div>
  )
}

export default function SettingsPage() {
  const router = useRouter()
  const { user, profile, reset } = useAuthStore()

  const [username, setUsername] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [deleting, setDeleting] = useState(false)

  // Notification settings
  const [emailNotifs, setEmailNotifs] = useState(true)
  const [pushNotifs, setPushNotifs] = useState(true)
  const [friendRequestNotifs, setFriendRequestNotifs] = useState(true)
  const [challengeNotifs, setChallengeNotifs] = useState(true)

  // Privacy settings
  const [profileVisible, setProfileVisible] = useState(true)
  const [showInLeaderboards, setShowInLeaderboards] = useState(true)

  useEffect(() => {
    if (profile) {
      setUsername(profile.username || '')
      setDisplayName(profile.display_name || '')
      setAvatarUrl(profile.avatar_url || '')
    }
  }, [profile])

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3000)
      return () => clearTimeout(t)
    }
  }, [toast])

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          display_name: displayName,
          avatar_url: avatarUrl,
          notifications: {
            email: emailNotifs,
            push: pushNotifs,
            friend_requests: friendRequestNotifs,
            challenges: challengeNotifs,
          },
          privacy: {
            profile_visible: profileVisible,
            show_in_leaderboards: showInLeaderboards,
          },
        }),
      })
      if (res.ok) {
        setToast({ message: 'Settings saved successfully!', type: 'success' })
      } else {
        const data = await res.json().catch(() => ({}))
        setToast({ message: data.error || 'Failed to save settings', type: 'error' })
      }
    } catch {
      setToast({ message: 'Something went wrong', type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  const handleSignOut = () => {
    reset()
    router.push('/login')
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== 'DELETE') return
    setDeleting(true)
    try {
      const res = await fetch('/api/account/delete', { method: 'DELETE' })
      if (res.ok) {
        reset()
        router.push('/')
      } else {
        setToast({ message: 'Failed to delete account', type: 'error' })
      }
    } catch {
      setToast({ message: 'Something went wrong', type: 'error' })
    } finally {
      setDeleting(false)
      setDeleteDialogOpen(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#090B14]">
      <div className="mx-auto max-w-2xl px-4 py-8">
        {/* Toast */}
        {toast && <Toast message={toast.message} type={toast.type} />}

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-bold text-[#F8FAFC] flex items-center gap-3">
            <Settings className="size-8 text-[#8B5CF6]" />
            Settings
          </h1>
          <p className="text-[#94A3B8] mt-1">Manage your account preferences</p>
        </motion.div>

        <div className="space-y-6">
          {/* Profile Section */}
          <motion.div custom={0} variants={sectionVariants} initial="hidden" animate="visible">
            <Card className="bg-[#111525] border-[#181D30]">
              <CardHeader>
                <CardTitle className="text-[#F8FAFC] flex items-center gap-2">
                  <User className="size-5 text-[#8B5CF6]" />
                  Profile
                </CardTitle>
                <CardDescription className="text-[#94A3B8]">Update your public profile information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-[#F8FAFC] text-sm">Username</Label>
                  <Input
                    value={username}
                    onChange={(e) => setUsername((e.target as HTMLInputElement).value)}
                    placeholder="Enter username"
                    className="bg-[#181D30] border-[#181D30] text-[#F8FAFC] placeholder:text-[#94A3B8]/60"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[#F8FAFC] text-sm">Display Name</Label>
                  <Input
                    value={displayName}
                    onChange={(e) => setDisplayName((e.target as HTMLInputElement).value)}
                    placeholder="Enter display name"
                    className="bg-[#181D30] border-[#181D30] text-[#F8FAFC] placeholder:text-[#94A3B8]/60"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[#F8FAFC] text-sm">Avatar URL</Label>
                  <Input
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl((e.target as HTMLInputElement).value)}
                    placeholder="https://example.com/avatar.png"
                    className="bg-[#181D30] border-[#181D30] text-[#F8FAFC] placeholder:text-[#94A3B8]/60"
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Account Section */}
          <motion.div custom={1} variants={sectionVariants} initial="hidden" animate="visible">
            <Card className="bg-[#111525] border-[#181D30]">
              <CardHeader>
                <CardTitle className="text-[#F8FAFC] flex items-center gap-2">
                  <Lock className="size-5 text-[#3B82F6]" />
                  Account
                </CardTitle>
                <CardDescription className="text-[#94A3B8]">Manage your account credentials</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-[#F8FAFC] text-sm">Email</Label>
                  <Input
                    value={user?.email || ''}
                    disabled
                    className="bg-[#181D30] border-[#181D30] text-[#94A3B8]"
                  />
                  <p className="text-xs text-[#94A3B8]">Email cannot be changed</p>
                </div>
                <Button variant="outline" className="border-[#181D30] text-[#F8FAFC] hover:bg-[#181D30]">
                  <Lock className="size-3.5 mr-1.5" />
                  Change Password
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Notifications Section */}
          <motion.div custom={2} variants={sectionVariants} initial="hidden" animate="visible">
            <Card className="bg-[#111525] border-[#181D30]">
              <CardHeader>
                <CardTitle className="text-[#F8FAFC] flex items-center gap-2">
                  <Bell className="size-5 text-[#22C55E]" />
                  Notifications
                </CardTitle>
                <CardDescription className="text-[#94A3B8]">Choose what notifications you receive</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[#F8FAFC]">Email Notifications</p>
                    <p className="text-xs text-[#94A3B8]">Receive updates via email</p>
                  </div>
                  <Switch checked={emailNotifs} onCheckedChange={setEmailNotifs} />
                </div>
                <Separator className="bg-[#181D30]" />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[#F8FAFC]">Push Notifications</p>
                    <p className="text-xs text-[#94A3B8]">Get notified in your browser</p>
                  </div>
                  <Switch checked={pushNotifs} onCheckedChange={setPushNotifs} />
                </div>
                <Separator className="bg-[#181D30]" />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[#F8FAFC]">Friend Requests</p>
                    <p className="text-xs text-[#94A3B8]">Notify when someone sends a friend request</p>
                  </div>
                  <Switch checked={friendRequestNotifs} onCheckedChange={setFriendRequestNotifs} />
                </div>
                <Separator className="bg-[#181D30]" />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[#F8FAFC]">Challenge Invites</p>
                    <p className="text-xs text-[#94A3B8]">Notify when you receive a challenge</p>
                  </div>
                  <Switch checked={challengeNotifs} onCheckedChange={setChallengeNotifs} />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Privacy Section */}
          <motion.div custom={3} variants={sectionVariants} initial="hidden" animate="visible">
            <Card className="bg-[#111525] border-[#181D30]">
              <CardHeader>
                <CardTitle className="text-[#F8FAFC] flex items-center gap-2">
                  <Shield className="size-5 text-[#94A3B8]" />
                  Privacy
                </CardTitle>
                <CardDescription className="text-[#94A3B8]">Control who can see your information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[#F8FAFC]">Public Profile</p>
                    <p className="text-xs text-[#94A3B8]">Allow other players to view your profile</p>
                  </div>
                  <Switch checked={profileVisible} onCheckedChange={setProfileVisible} />
                </div>
                <Separator className="bg-[#181D30]" />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[#F8FAFC]">Show in Leaderboards</p>
                    <p className="text-xs text-[#94A3B8]">Appear in public leaderboard rankings</p>
                  </div>
                  <Switch checked={showInLeaderboards} onCheckedChange={setShowInLeaderboards} />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Save Button */}
          <motion.div custom={4} variants={sectionVariants} initial="hidden" animate="visible">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="w-full h-10 bg-[#8B5CF6] hover:bg-[#8B5CF6]/80 text-white font-medium"
            >
              {saving ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="size-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </motion.div>

          {/* Danger Zone */}
          <motion.div custom={5} variants={sectionVariants} initial="hidden" animate="visible">
            <Card className="bg-[#111525] border-red-500/20">
              <CardHeader>
                <CardTitle className="text-red-400 flex items-center gap-2">
                  <AlertTriangle className="size-5" />
                  Danger Zone
                </CardTitle>
                <CardDescription className="text-[#94A3B8]">Irreversible account actions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-[#F8FAFC]">Sign Out</p>
                    <p className="text-xs text-[#94A3B8]">Sign out from your account on this device</p>
                  </div>
                  <Button variant="outline" onClick={handleSignOut} className="border-[#181D30] text-[#F8FAFC] hover:bg-[#181D30]">
                    <LogOut className="size-3.5 mr-1.5" />
                    Sign Out
                  </Button>
                </div>
                <Separator className="bg-[#181D30]" />
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-[#F8FAFC]">Delete Account</p>
                    <p className="text-xs text-[#94A3B8]">Permanently delete your account and all data</p>
                  </div>
                  <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                    <DialogTrigger render={
                      <Button variant="destructive">
                        <Trash2 className="size-3.5 mr-1.5" />
                        Delete Account
                      </Button>
                    } />
                    <DialogContent className="bg-[#111525] border-[#181D30]">
                      <DialogHeader>
                        <DialogTitle className="text-[#F8FAFC]">Delete Account</DialogTitle>
                        <DialogDescription className="text-[#94A3B8]">
                          This action cannot be undone. All your data, scores, achievements, and progress will be permanently deleted.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-2 py-2">
                        <Label className="text-sm text-[#F8FAFC]">
                          Type <span className="font-mono font-bold text-red-400">DELETE</span> to confirm
                        </Label>
                        <Input
                          value={deleteConfirm}
                          onChange={(e) => setDeleteConfirm((e.target as HTMLInputElement).value)}
                          placeholder="Type DELETE"
                          className="bg-[#181D30] border-[#181D30] text-[#F8FAFC]"
                        />
                      </div>
                      <DialogFooter className="bg-[#0D0F1A]">
                        <DialogClose render={
                          <Button variant="outline" className="border-[#181D30] text-[#F8FAFC]">
                            Cancel
                          </Button>
                        } />
                        <Button
                          variant="destructive"
                          onClick={handleDeleteAccount}
                          disabled={deleteConfirm !== 'DELETE' || deleting}
                        >
                          {deleting ? (
                            <Loader2 className="size-3.5 animate-spin mr-1.5" />
                          ) : (
                            <Trash2 className="size-3.5 mr-1.5" />
                          )}
                          Delete Account
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

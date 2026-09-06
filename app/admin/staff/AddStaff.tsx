import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PERMISSION_MODULES } from "@/types/permissions"
import { createStaff } from "./actions"

const PERMISSION_OPTIONS = [
  { value: "null", label: "None" },
  { value: "read", label: "Read" },
  { value: "full", label: "Full" },
] as const

export const AddStaff = () => {
  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button size="sm">
            <span className="mr-1 text-base leading-none">+</span>
            New Staff
          </Button>
        }
      />

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add New Staff</DialogTitle>
          <DialogDescription>
            Create a staff account and configure access permissions.
          </DialogDescription>
        </DialogHeader>

        <form action={createStaff} className="space-y-6">
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="John Doe"
                autoComplete="name"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="john@example.com"
                autoComplete="email"
                required
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label>Module Permissions</Label>
            <div className="space-y-2">
              {PERMISSION_MODULES.map((mod) => (
                <div
                  key={mod.key}
                  className="flex items-center justify-between rounded-lg border px-4 py-3"
                >
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium">{mod.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {mod.description}
                    </p>
                  </div>

                  <div className="flex gap-1">
                    {PERMISSION_OPTIONS.map((opt) => (
                      <label
                        key={opt.value}
                        htmlFor={`${mod.key}_${opt.value}`}
                        className="cursor-pointer"
                      >
                        <input
                          type="radio"
                          id={`${mod.key}_${opt.value}`}
                          name={`permission_${mod.key}`}
                          value={opt.value}
                          defaultChecked={opt.value === "null"}
                          className="sr-only peer"
                        />
                        <span className="inline-flex items-center justify-center rounded-md border border-input px-3 py-1 text-xs font-medium transition-colors hover:bg-accent hover:text-accent-foreground peer-checked:bg-primary peer-checked:text-primary-foreground">
                          {opt.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button type="submit">Create Staff</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default AddStaff

<script setup lang="ts">
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Plus, Save, Loader2, XCircle, CheckCircle } from 'lucide-vue-next'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { h, ref, watch } from 'vue'
import { toast } from 'vue-sonner';
import { request } from '@/lib/api'

const emit = defineEmits(['success'])

const action = ref('')
const subject = ref('')
const description = ref('')
const name = ref('')
const conditions = ref('')
const inverted = ref(false)
const loading = ref(false)
const showLoading = ref(false)
let loadingTimeout: any = null
const isOpen = ref(false)

const errors = ref({
    action: '',
    subject: '',
    conditions: '',
    name: '',
})

const actionOptions = ref(['manage', 'create', 'read', 'update', 'delete'])
const subjectOptions = ref(['all', 'User', 'Role', 'Permission'])

const fetchOptions = async () => {
    try {
        const [actionsRes, subjectsRes] = await Promise.all([
            request('/permissions/actions'),
            request('/permissions/subjects')
        ])

        if (actionsRes.ok) {
            const actions = await actionsRes.json()
            if (Array.isArray(actions)) {
                actionOptions.value = Array.from(new Set([...actionOptions.value, ...actions]))
            }
        }

        if (subjectsRes.ok) {
            const subjects = await subjectsRes.json()
            if (Array.isArray(subjects)) {
                subjectOptions.value = Array.from(new Set([...subjectOptions.value, ...subjects]))
            }
        }
    } catch (e) {
        console.error('Failed to fetch options:', e)
    }
}

watch(isOpen, (newVal) => {
    if (newVal) {
        fetchOptions()
    }
})

const handleSubmit = async () => {
    // Reset errors
    errors.value.action = ''
    errors.value.subject = ''
    errors.value.conditions = ''

    // Validate
    let hasError = false
    if (!name.value.trim()) {
        errors.value.name = 'Tên permission không được để trống'
        hasError = true
    }
    if (!action.value) {
        errors.value.action = 'Action không được để trống'
        hasError = true
    }
    if (!subject.value.trim()) {
        errors.value.subject = 'Subject không được để trống'
        hasError = true
    }

    let parsedConditions = null
    if (conditions.value.trim()) {
        try {
            parsedConditions = JSON.parse(conditions.value.trim())
        } catch (e) {
            errors.value.conditions = 'Định dạng JSON không hợp lệ'
            hasError = true
        }
    }

    if (hasError) return

    loading.value = true
    loadingTimeout = setTimeout(() => {
        showLoading.value = true
    }, 1000)

    try {
        const payload = {
            name: name.value.trim(),
            action: action.value,
            subject: subject.value.trim(),
            description: description.value.trim() || null,
            conditions: parsedConditions,
            inverted: inverted.value,
        }

        const response = await request('/permissions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        })

        if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.message || 'Có lỗi xảy ra khi thêm permission')
        }

        // Reset form
        name.value = ''
        action.value = ''
        subject.value = ''
        description.value = ''
        conditions.value = ''
        inverted.value = false

        // Close dialog
        isOpen.value = false

        // Notify parent to refresh list
        emit('success')

        toast('Thông báo', {
            description: 'Thêm permission thành công',
            icon: h(CheckCircle, { class: 'text-green-500 w-5 h-5' }),
            position: 'top-center',
        });
    } catch (err: any) {
        toast('Thông báo', {
            description: err.message,
            icon: h(XCircle, { class: 'text-red-500 w-5 h-5' }),
            position: 'top-center',
        });
    } finally {
        if (loadingTimeout) clearTimeout(loadingTimeout)
        loading.value = false
        showLoading.value = false
    }
}
</script>

<template>
    <Dialog v-model:open="isOpen">
        <DialogTrigger as-child>
            <Button class="w-full md:w-auto" @click="isOpen = true">
                <Plus /> Thêm mới
            </Button>
        </DialogTrigger>
        <DialogContent class="sm:max-w-[500px]">
            <DialogHeader>
                <DialogTitle>Thêm Permission</DialogTitle>
                <DialogDescription>
                    Tạo permission mới để gán vào role.
                </DialogDescription>
            </DialogHeader>
            <div class="mt-3 grid gap-4 max-h-[70vh] overflow-y-auto px-1 text-left">
                <div class="grid gap-2">
                    <Label class="text-gray-800 font-medium">Tên hiển thị <span class="text-red-500">*</span></Label>
                    <Input v-model="name" placeholder="VD: create_user, approve_order..." :disabled="loading"
                        :class="{ 'border-red-500': errors.name }" @update:model-value="errors.name = ''" />
                    <p v-if="errors.name" class="text-[13px] text-red-500 font-medium">{{ errors.name }}</p>
                </div>
                <div class="grid gap-2 p-3 border rounded-md bg-gray-50/30">
                    <Label class="text-gray-800 font-medium mb-1">Hành động (Actions) <span
                            class="text-red-500">*</span></Label>
                    <div class="grid grid-cols-2 gap-3">
                        <div v-for="opt in actionOptions" :key="opt" class="flex items-center space-x-2">
                            <input type="checkbox" :id="'create-action-' + opt" :value="opt"
                                :checked="action.split(',').map(a => a.trim()).includes(opt)" @change="(e) => {
                                    const checked = (e.target as HTMLInputElement).checked
                                    let currentActions = action ? action.split(',').map(a => a.trim()).filter(a => a) : []
                                    if (checked) {
                                        if (!currentActions.includes(opt)) currentActions.push(opt)
                                    } else {
                                        currentActions = currentActions.filter(a => a !== opt)
                                    }
                                    action = currentActions.join(',')
                                    errors.action = ''
                                }" class="w-4 h-4 accent-primary cursor-pointer" />
                            <label :for="'create-action-' + opt" class="text-sm cursor-pointer select-none">{{ opt
                            }}</label>
                        </div>
                    </div>
                    <div class="mt-2 pt-2 border-t border-dashed">
                        <Label class="text-[11px] text-gray-500 uppercase">Hoặc nhập thủ công (ngăn cách bằng dấu
                            phẩy):</Label>
                        <Input v-model="action" placeholder="VD: custom_action, another_one" class="h-8 text-xs mt-1"
                            :disabled="loading" />
                    </div>
                    <p v-if="errors.action" class="text-[13px] text-red-500 mt-1">{{ errors.action }}</p>
                </div>
                <div class="grid gap-2">
                    <Label class="text-gray-800">Subject <span class="text-red-500">*</span></Label>
                    <Select v-model="subject" @update:model-value="errors.subject = ''">
                        <SelectTrigger class="w-full" :class="{ 'border-red-500': errors.subject }">
                            <SelectValue placeholder="Chọn subject" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectItem v-for="opt in subjectOptions" :key="opt" :value="opt">
                                    {{ opt }}
                                </SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                    <p v-if="errors.subject" class="text-[13px] text-red-500">{{ errors.subject }}</p>
                </div>
                <div class="grid gap-2">
                    <Label class="text-gray-800">Mô tả</Label>
                    <Input v-model="description" placeholder="VD: Tạo người dùng mới" :disabled="loading" />
                </div>
                <div class="grid gap-2">
                    <Label class="text-gray-800">Conditions (JSON)</Label>
                    <Textarea v-model="conditions" placeholder='VD: { "id": "${user.id}" }' :disabled="loading"
                        :class="{ 'border-red-500': errors.conditions }" />
                    <p v-if="errors.conditions" class="text-[13px] text-red-500">{{ errors.conditions }}</p>
                </div>
                <div
                    class="flex items-center justify-between space-x-2 rounded-lg border p-3 bg-amber-50/30 border-amber-200">
                    <div class="space-y-0.5 flex-1">
                        <Label for="inverted-mode-native" class="text-base cursor-pointer font-bold text-amber-900">Chế
                            độ cấm (Inverted)</Label>
                        <p class="text-[13px] text-amber-700">
                            Bật để tạo quyền "KHÔNG ĐƯỢC PHÉP". Trạng thái: <span class="font-bold underline">{{
                                inverted ? 'ĐANG BẬT' : 'ĐANG TẮT' }}</span>
                        </p>
                    </div>
                    <input type="checkbox" id="inverted-mode-native" v-model="inverted" :disabled="loading"
                        class="w-6 h-6 cursor-pointer accent-amber-600" />
                </div>
            </div>
            <DialogFooter>
                <Button class="mt-3" @click="handleSubmit" :disabled="loading">
                    <template v-if="showLoading">
                        <Loader2 class="animate-spin" /> Đang lưu...
                    </template>
                    <template v-else>
                        <Save /> Lưu
                    </template>
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
</template>

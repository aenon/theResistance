import type { Role, RoleInfo } from './types'

export const ROLE_INFO: Record<Role, RoleInfo> = {
  merlin: {
    id: 'merlin',
    name: '梅林',
    team: 'good',
    optional: true,
    description: '知道所有坏人是谁（莫德雷德除外），但身份暴露就会被刺杀。',
  },
  percival: {
    id: 'percival',
    name: '派西维尔',
    team: 'good',
    optional: true,
    description: '看到梅林和莫甘娜两个人，但分不清谁是谁。',
  },
  loyalServant: {
    id: 'loyalServant',
    name: '亚瑟的忠臣',
    team: 'good',
    optional: false,
    description: '没有额外信息，靠推理帮好人完成任务。',
  },
  assassin: {
    id: 'assassin',
    name: '刺客',
    team: 'evil',
    optional: true,
    description: '好人拿下三次任务后，由你指认梅林；指对了坏人翻盘获胜。',
  },
  morgana: {
    id: 'morgana',
    name: '莫甘娜',
    team: 'evil',
    optional: true,
    description: '在派西维尔眼里和梅林长得一样，用来混淆视听。',
  },
  mordred: {
    id: 'mordred',
    name: '莫德雷德',
    team: 'evil',
    optional: true,
    description: '梅林看不到你，是坏人阵营最隐蔽的一张牌。',
  },
  oberon: {
    id: 'oberon',
    name: '奥伯伦',
    team: 'evil',
    optional: true,
    description: '不认识其他坏人，其他坏人也不认识你，但梅林看得到你。',
  },
  minion: {
    id: 'minion',
    name: '莫甘娜的爪牙',
    team: 'evil',
    optional: false,
    description: '普通坏人，和同伴一起破坏任务。',
  },
}

export const OPTIONAL_ROLES: Role[] = [
  'merlin',
  'percival',
  'assassin',
  'morgana',
  'mordred',
  'oberon',
]

export function isEvil(role: Role): boolean {
  return ROLE_INFO[role].team === 'evil'
}

export function roleName(role: Role): string {
  return ROLE_INFO[role].name
}

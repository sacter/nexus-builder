import type { ComponentCategory } from '@lowcode/common'
import { COMPONENT_CATEGORIES } from '@lowcode/common'
import { useComponentStore, type ComponentConfig } from '@/stores/components'
import {
  Document,
  SwitchButton,
  Picture,
  Grid,
  Edit,
  ArrowDown,
} from '@element-plus/icons-vue'

export function registerComponent(config: ComponentConfig) {
  const store = useComponentStore()
  store.registerComponent(config)
}

export function resolveComponentLoader(type: string) {
  const store = useComponentStore()
  return store.getComponent(type)?.render
}

export function registerBuiltInComponents() {
  const builtins: ComponentConfig[] = [
    /* ─── 基础组件 ─── */
    {
      type: 'ElText',
      displayName: '文本',
      icon: Document,
      category: COMPONENT_CATEGORIES.BASIC as ComponentCategory,
      defaultProps: { text: '这是文本内容', _desc: '静态文本展示' },
      render: () => import('./basic/TextComponent.vue'),
    },
    {
      type: 'ElButton',
      displayName: '按钮',
      icon: SwitchButton,
      category: COMPONENT_CATEGORIES.BASIC as ComponentCategory,
      defaultProps: { text: '按钮', type: 'primary', _desc: '主/次/危险操作按钮' },
      render: () => import('./basic/ButtonComponent.vue'),
    },
    {
      type: 'ElImage',
      displayName: '图片',
      icon: Picture,
      category: COMPONENT_CATEGORIES.BASIC as ComponentCategory,
      defaultProps: { src: 'https://placehold.co/400x200', fit: 'cover', _desc: '图片展示' },
      render: () => import('./basic/ImageComponent.vue'),
    },

    /* ─── 表单组件 ─── */
    {
      type: 'ElInput',
      displayName: '输入框',
      icon: Edit,
      category: COMPONENT_CATEGORIES.FORM as ComponentCategory,
      defaultProps: { placeholder: '请输入', modelValue: '', _desc: '单行文本输入' },
      render: () => import('./form/InputComponent.vue'),
    },
    {
      type: 'ElSelect',
      displayName: '下拉选择',
      icon: ArrowDown,
      category: COMPONENT_CATEGORIES.FORM as ComponentCategory,
      defaultProps: { placeholder: '请选择', options: [], _desc: '单选/多选下拉菜单' },
      render: () => import('./form/SelectComponent.vue'),
    },
    {
      type: 'ElDatePicker',
      displayName: '日期选择',
      icon: Edit,
      category: COMPONENT_CATEGORIES.FORM as ComponentCategory,
      defaultProps: { placeholder: '选择日期范围', _desc: '日期/时间范围选择' },
      render: () => import('./form/DatePickerComponent.vue'),
    },
    {
      type: 'ElUpload',
      displayName: '上传组件',
      icon: Picture,
      category: COMPONENT_CATEGORIES.FORM as ComponentCategory,
      defaultProps: { _desc: '文件/图片拖拽上传' },
      render: () => import('./form/UploadComponent.vue'),
    },

    /* ─── 数据展示 ─── */
    {
      type: 'ElTable',
      displayName: '数据表格',
      icon: Grid,
      category: COMPONENT_CATEGORIES.DATA_DISPLAY as ComponentCategory,
      defaultProps: { _desc: '分页、排序、筛选表格' },
      render: () => import('./data/TableComponent.vue'),
    },

    /* ─── 图表组件 ─── */
    {
      type: 'ElLineChart',
      displayName: '折线图',
      icon: Document,
      category: COMPONENT_CATEGORIES.CHART as ComponentCategory,
      defaultProps: { _desc: '时间序列趋势图' },
      render: () => import('./chart/LineChartComponent.vue'),
    },
    {
      type: 'ElBarChart',
      displayName: '柱状图',
      icon: Document,
      category: COMPONENT_CATEGORIES.CHART as ComponentCategory,
      defaultProps: { _desc: '分类对比柱状图' },
      render: () => import('./chart/BarChartComponent.vue'),
    },

    /* ─── 容器组件 ─── */
    {
      type: 'ElContainer',
      displayName: '容器',
      icon: Grid,
      category: COMPONENT_CATEGORIES.CONTAINER as ComponentCategory,
      defaultProps: { _desc: '自由布局容器' },
      render: () => import('./container/ContainerComponent.vue'),
    },
    {
      type: 'ElForm',
      displayName: '表单容器',
      icon: Edit,
      category: COMPONENT_CATEGORIES.CONTAINER as ComponentCategory,
      defaultProps: { _desc: '含验证的表单布局' },
      render: () => import('./container/FormComponent.vue'),
    },
    {
      type: 'ElCardGroup',
      displayName: '卡片组',
      icon: Grid,
      category: COMPONENT_CATEGORIES.CONTAINER as ComponentCategory,
      defaultProps: { _desc: '统计指标卡片组' },
      render: () => import('./container/CardGroupComponent.vue'),
    },
    {
      type: 'ElTabs',
      displayName: '标签页',
      icon: Document,
      category: COMPONENT_CATEGORIES.CONTAINER as ComponentCategory,
      defaultProps: { _desc: '水平/垂直标签切换' },
      render: () => import('./container/TabsComponent.vue'),
    },

    /* ─── 高级组件 ─── */
    {
      type: 'ElModal',
      displayName: '弹窗对话框',
      icon: Document,
      category: COMPONENT_CATEGORIES.ADVANCED as ComponentCategory,
      defaultProps: { _desc: '确认、表单、信息弹窗' },
      render: () => import('./advanced/ModalComponent.vue'),
    },
  ]

  for (const comp of builtins) {
    registerComponent(comp)
  }
}

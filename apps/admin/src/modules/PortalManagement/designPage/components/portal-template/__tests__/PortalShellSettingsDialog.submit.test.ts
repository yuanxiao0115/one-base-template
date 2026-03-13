/* eslint-disable vue/one-component-per-file */
import { describe, expect, it } from 'vitest';
import { defineComponent, h } from 'vue';
import { mount } from '@vue/test-utils';

import PortalShellSettingsDialog from '../PortalShellSettingsDialog.vue';

interface ShellStateLike {
  shell: {
    header: {
      enabled: boolean;
    };
    footer: {
      enabled: boolean;
    };
  };
}

const ObCrudContainerStub = defineComponent({
  name: 'ObCrudContainer',
  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['update:modelValue', 'confirm', 'cancel', 'close'],
  setup(props, { slots, emit }) {
    return () =>
      h('div', { 'data-testid': 'ob-crud-container', 'data-visible': String(props.modelValue) }, [
        slots.default?.(),
        h(
          'button',
          {
            type: 'button',
            'data-testid': 'confirm',
            onClick: () => emit('confirm'),
          },
          'confirm'
        ),
      ]);
  },
});

const ElTabsStub = defineComponent({
  name: 'ElTabs',
  setup(_, { slots }) {
    return () => h('div', { 'data-testid': 'el-tabs' }, slots.default?.());
  },
});

const ElTabPaneStub = defineComponent({
  name: 'ElTabPane',
  setup(_, { slots }) {
    return () => h('div', { 'data-testid': 'el-tab-pane' }, slots.default?.());
  },
});

const HeaderFormStub = defineComponent({
  name: 'PortalShellHeaderSettingsForm',
  props: {
    formState: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    return () =>
      h(
        'button',
        {
          type: 'button',
          'data-testid': 'disable-header',
          onClick: () => {
            (props.formState as ShellStateLike).shell.header.enabled = false;
          },
        },
        'disable-header'
      );
  },
});

const FooterFormStub = defineComponent({
  name: 'PortalShellFooterSettingsForm',
  props: {
    formState: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    return () =>
      h(
        'button',
        {
          type: 'button',
          'data-testid': 'disable-footer',
          onClick: () => {
            (props.formState as ShellStateLike).shell.footer.enabled = false;
          },
        },
        'disable-footer'
      );
  },
});

describe('PortalShellSettingsDialog submit', () => {
  it('应以开关值为准写回 pageHeader/pageFooter', async () => {
    const wrapper = mount(PortalShellSettingsDialog, {
      props: {
        modelValue: true,
        details: JSON.stringify({
          schemaVersion: 1,
          pageHeader: 1,
          pageFooter: 1,
          shell: {
            header: { enabled: true },
            footer: { enabled: true },
          },
          pageOverrides: {},
        }),
      },
      global: {
        stubs: {
          ObCrudContainer: ObCrudContainerStub,
          PortalShellHeaderSettingsForm: HeaderFormStub,
          PortalShellFooterSettingsForm: FooterFormStub,
          ElButton: true,
          ElTabs: ElTabsStub,
          ElTabPane: ElTabPaneStub,
          ElDrawer: true,
        },
      },
    });

    await wrapper.get("[data-testid='disable-header']").trigger('click');
    await wrapper.get("[data-testid='disable-footer']").trigger('click');
    await wrapper.get("[data-testid='confirm']").trigger('click');

    const submitEvents = wrapper.emitted('submit');
    expect(submitEvents?.length).toBe(1);

    const payload = submitEvents?.[0]?.[0] as { details: string };
    const details = JSON.parse(payload.details) as {
      pageHeader?: unknown;
      pageFooter?: unknown;
      shell?: { header?: { enabled?: unknown }; footer?: { enabled?: unknown } };
    };

    expect(details.pageHeader).toBe(0);
    expect(details.pageFooter).toBe(0);
    expect(details.shell?.header?.enabled).toBe(false);
    expect(details.shell?.footer?.enabled).toBe(false);
  });
});

import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { NgxBootstrapIconsModule, allIcons as bootstrapIcons } from 'ngx-bootstrap-icons';
import {
  IconModule,
  StackedIconComponent,
  StackedIconModule,
  allIcons as sdsIcons,
  uswdsAllIcons,
} from 'projects/icons/src/public-api';
import * as _ from 'lodash';
import { appendPrefix } from '../app/app.module';

const icons = Object.assign(
  {},
  _.cloneDeep(bootstrapIcons),
  appendPrefix(_.cloneDeep(sdsIcons), 'sds'),
  _.cloneDeep(uswdsAllIcons),
);

const meta: Meta<StackedIconComponent> = {
  title: 'Icons/StackedIconComponent',
  component: StackedIconComponent,
  decorators: [
    moduleMetadata({
      imports: [IconModule, StackedIconModule, NgxBootstrapIconsModule.pick(icons)],
    }),
  ],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'lg', '2x', '3x', '4x'],
    },
  },
  args: {
    size: '2x',
  },
};
export default meta;

type Story = StoryObj<StackedIconComponent>;

/**
 * Two `usa-icon`s layered via `usa-stack-icon`: a filled background shape
 * behind a smaller foreground glyph.
 */
export const Basic: Story = {
  render: (args) => ({
    props: args,
    template: `
      <usa-stacked-icon [size]="size">
        <usa-icon class="usa-stack-icon" size="2x" icon="squareFill"></usa-icon>
        <usa-icon class="usa-stack-icon" size="lg" icon="handThumbsDown"></usa-icon>
      </usa-stacked-icon>
    `,
  }),
};

/** Stacking works with the library's own USWDS and custom icon sets too. */
export const WithLibraryIcons: Story = {
  render: (args) => ({
    props: args,
    template: `
      <usa-stacked-icon [size]="size">
        <usa-icon class="usa-stack-icon" size="2x" icon="circleFill"></usa-icon>
        <usa-icon class="usa-stack-icon" size="lg" icon="uswdsCheck"></usa-icon>
      </usa-stacked-icon>
    `,
  }),
};

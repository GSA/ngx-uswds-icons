import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { NgxBootstrapIconsModule, allIcons as bootstrapIcons } from 'ngx-bootstrap-icons';
import { IconComponent, IconModule, allIcons as sdsIcons, uswdsAllIcons } from 'projects/icons/src/public-api';
import { appendPrefix } from '../app/app.module';

// Registers every icon this library ships (USWDS + SDS custom icons + the
// underlying Bootstrap set) so the a11y gate exercises the full rendered SVG
// surface, not a hand-picked subset. Icon values are plain immutable SVG path
// strings, so a shallow merge is sufficient — no deep clone needed.
const icons = Object.assign({}, bootstrapIcons, appendPrefix(sdsIcons, 'sds'), uswdsAllIcons);

const meta: Meta<IconComponent> = {
  title: 'Icons/IconComponent',
  component: IconComponent,
  decorators: [
    moduleMetadata({
      imports: [IconModule, NgxBootstrapIconsModule.pick(icons)],
    }),
  ],
  argTypes: {
    icon: {
      control: 'select',
      options: [
        'gear',
        'squareFill',
        'handThumbsDown',
        'uswdsHome',
        'uswdsSearch',
        'uswdsWarning',
        'sdsAdd',
        'sdsUser',
        'sdsDocument',
      ],
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'lg', '2x', '3x', '4x', '5x', '6x', '7x', '8x', '9x', '10x'],
    },
    rotate: {
      control: 'select',
      options: [0, 30, 45, 60, 90, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315, 330],
    },
    classes: { table: { disable: true } },
    skew: { table: { disable: true } },
  },
  args: {
    icon: 'gear',
    size: 'lg',
    rotate: 0,
  },
};
export default meta;

type Story = StoryObj<IconComponent>;

/** An icon from the underlying Bootstrap Icons set that `usa-icon` wraps. */
export const Bootstrap: Story = {
  args: { icon: 'gear' },
};

/** A USWDS icon, exported from this library's `uswds-icons` set. */
export const Uswds: Story = {
  args: { icon: 'uswdsHome' },
};

/** A custom "SDS" icon bundled with this library, registered under an `sds` prefix. */
export const CustomSds: Story = {
  args: { icon: 'sdsAdd' },
};

/** Icons support rotation via the `rotate` input. */
export const Rotated: Story = {
  args: { icon: 'uswdsSearch', rotate: 90 },
};

/** Icons render at different sizes via the `size` input. */
export const LargeSize: Story = {
  args: { icon: 'sdsUser', size: '4x' },
};

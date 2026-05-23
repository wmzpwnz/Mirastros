import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { FormGroup } from '../../src/components/FormGroup';
import { Input } from '../../src/components/Input';
import { Select } from '../../src/components/Select';
import { Textarea } from '../../src/components/Textarea';

const meta = {
  title: 'Components/FormGroup',
  component: FormGroup,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    required: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof FormGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Email Address',
    children: <Input type="email" placeholder="Enter your email" />,
  },
};

export const Required: Story = {
  args: {
    label: 'Email Address',
    required: true,
    children: <Input type="email" placeholder="Enter your email" />,
  },
};

export const WithError: Story = {
  args: {
    label: 'Email Address',
    error: 'Please enter a valid email address',
    children: <Input type="email" placeholder="Enter your email" />,
  },
};

export const WithHelperText: Story = {
  args: {
    label: 'Password',
    helperText: 'Must be at least 8 characters long',
    children: <Input type="password" placeholder="Enter your password" />,
  },
};

export const WithErrorAndHelper: Story = {
  args: {
    label: 'Password',
    error: 'Password is too short',
    helperText: 'Must be at least 8 characters long',
    children: <Input type="password" placeholder="Enter your password" />,
  },
};

export const WithSelect: Story = {
  args: {
    label: 'Country',
    required: true,
    children: (
      <Select
        options={[
          { label: 'United States', value: 'us' },
          { label: 'Canada', value: 'ca' },
          { label: 'Mexico', value: 'mx' },
        ]}
        placeholder="Select a country"
      />
    ),
  },
};

export const WithTextarea: Story = {
  args: {
    label: 'Message',
    required: true,
    helperText: 'Maximum 500 characters',
    children: (
      <Textarea
        placeholder="Enter your message"
        maxLength={500}
        showCharCount
        rows={4}
      />
    ),
  },
};

export const Interactive: Story = {
  render: () => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');

    const handleChange = (value: string) => {
      setEmail(value);
      if (value && !value.includes('@')) {
        setError('Please enter a valid email address');
      } else {
        setError('');
      }
    };

    return (
      <div className="w-96">
        <FormGroup
          label="Email Address"
          required
          error={error}
          helperText="We'll never share your email"
          id="email"
        >
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={handleChange}
          />
        </FormGroup>
      </div>
    );
  },
};

export const FormExample: Story = {
  render: () => {
    const [formData, setFormData] = useState({
      name: '',
      email: '',
      country: '',
      message: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleChange = (field: string, value: string | number) => {
      setFormData({ ...formData, [field]: value });
      if (errors[field]) {
        setErrors({ ...errors, [field]: '' });
      }
    };

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const newErrors: Record<string, string> = {};

      if (!formData.name) newErrors.name = 'Name is required';
      if (!formData.email) newErrors.email = 'Email is required';
      if (!formData.country) newErrors.country = 'Country is required';
      if (!formData.message) newErrors.message = 'Message is required';

      setErrors(newErrors);
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-6 w-96">
        <FormGroup
          label="Full Name"
          required
          error={errors.name}
          id="name"
        >
          <Input
            type="text"
            placeholder="Enter your name"
            value={formData.name}
            onChange={(val) => handleChange('name', val)}
          />
        </FormGroup>

        <FormGroup
          label="Email Address"
          required
          error={errors.email}
          helperText="We'll never share your email"
          id="email"
        >
          <Input
            type="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={(val) => handleChange('email', val)}
          />
        </FormGroup>

        <FormGroup
          label="Country"
          required
          error={errors.country}
          id="country"
        >
          <Select
            options={[
              { label: 'United States', value: 'us' },
              { label: 'Canada', value: 'ca' },
              { label: 'Mexico', value: 'mx' },
            ]}
            value={formData.country}
            onChange={(val) => handleChange('country', val)}
            placeholder="Select a country"
          />
        </FormGroup>

        <FormGroup
          label="Message"
          required
          error={errors.message}
          helperText="Maximum 500 characters"
          id="message"
        >
          <Textarea
            placeholder="Enter your message"
            value={formData.message}
            onChange={(val) => handleChange('message', val)}
            maxLength={500}
            showCharCount
            rows={4}
          />
        </FormGroup>

        <button
          type="submit"
          className="w-full px-6 py-2 bg-gold-500 text-cosmic rounded font-semibold hover:bg-gold-600 transition-colors"
        >
          Submit
        </button>
      </form>
    );
  },
};

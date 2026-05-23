import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Button } from '../../src/components/Button';
import { Input } from '../../src/components/Input';
import { Label } from '../../src/components/Label';
import { Select } from '../../src/components/Select';
import { Checkbox } from '../../src/components/Checkbox';
import { Radio, RadioGroup } from '../../src/components/Radio';
import { Textarea } from '../../src/components/Textarea';
import { FormGroup } from '../../src/components/FormGroup';
import { Toast, ToastContainer } from '../../src/components/Toast';

const meta = {
  title: 'Patterns/Form Patterns',
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const LoginForm: Story = {
  render: () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const newErrors: Record<string, string> = {};

      if (!email) newErrors.email = 'Email is required';
      if (!password) newErrors.password = 'Password is required';

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
      } else {
        setErrors({});
        alert('Form submitted successfully!');
      }
    };

    return (
      <div className="min-h-screen bg-cosmic flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-bold text-gold-500 mb-8 text-center">Login</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <FormGroup
              label="Email Address"
              error={errors.email}
              required
            >
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={setEmail}
                error={errors.email ? 'Invalid email' : undefined}
              />
            </FormGroup>

            <FormGroup
              label="Password"
              error={errors.password}
              required
            >
              <Input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={setPassword}
                error={errors.password ? 'Password required' : undefined}
              />
            </FormGroup>

            <div className="flex items-center">
              <Checkbox id="remember" />
              <Label htmlFor="remember" className="ml-2">
                Remember me
              </Label>
            </div>

            <Button type="submit" variant="primary" className="w-full">
              Sign In
            </Button>

            <p className="text-center text-gray-400">
              Don't have an account?{' '}
              <a href="#" className="text-gold-500 hover:text-gold-600">
                Sign up
              </a>
            </p>
          </form>
        </div>
      </div>
    );
  },
};

export const RegistrationForm: Story = {
  render: () => {
    const [formData, setFormData] = useState({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      country: '',
      terms: false,
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleChange = (field: string, value: any) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const newErrors: Record<string, string> = {};

      if (!formData.firstName) newErrors.firstName = 'First name is required';
      if (!formData.lastName) newErrors.lastName = 'Last name is required';
      if (!formData.email) newErrors.email = 'Email is required';
      if (!formData.password) newErrors.password = 'Password is required';
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
      if (!formData.terms) newErrors.terms = 'You must accept the terms';

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
      } else {
        setErrors({});
        alert('Registration successful!');
      }
    };

    return (
      <div className="min-h-screen bg-cosmic p-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-gold-500 mb-8">Create Account</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <FormGroup label="First Name" error={errors.firstName} required>
                <Input
                  type="text"
                  placeholder="John"
                  value={formData.firstName}
                  onChange={(val) => handleChange('firstName', val)}
                  error={errors.firstName ? 'Required' : undefined}
                />
              </FormGroup>

              <FormGroup label="Last Name" error={errors.lastName} required>
                <Input
                  type="text"
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={(val) => handleChange('lastName', val)}
                  error={errors.lastName ? 'Required' : undefined}
                />
              </FormGroup>
            </div>

            <FormGroup label="Email Address" error={errors.email} required>
              <Input
                type="email"
                placeholder="john@example.com"
                value={formData.email}
                onChange={(val) => handleChange('email', val)}
                error={errors.email ? 'Required' : undefined}
              />
            </FormGroup>

            <FormGroup label="Country" required>
              <Select
                options={[
                  { label: 'United States', value: 'us' },
                  { label: 'Canada', value: 'ca' },
                  { label: 'United Kingdom', value: 'uk' },
                  { label: 'Australia', value: 'au' },
                ]}
                placeholder="Select a country"
                value={formData.country}
                onChange={(val) => handleChange('country', val)}
              />
            </FormGroup>

            <div className="grid grid-cols-2 gap-6">
              <FormGroup label="Password" error={errors.password} required>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(val) => handleChange('password', val)}
                  error={errors.password ? 'Required' : undefined}
                />
              </FormGroup>

              <FormGroup label="Confirm Password" error={errors.confirmPassword} required>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(val) => handleChange('confirmPassword', val)}
                  error={errors.confirmPassword ? 'Passwords do not match' : undefined}
                />
              </FormGroup>
            </div>

            <div className="flex items-start gap-3">
              <Checkbox
                id="terms"
                checked={formData.terms}
                onChange={(checked) => handleChange('terms', checked)}
              />
              <Label htmlFor="terms" className="text-sm">
                I agree to the Terms of Service and Privacy Policy
              </Label>
            </div>
            {errors.terms && <p className="text-error text-sm">{errors.terms}</p>}

            <Button type="submit" variant="primary" className="w-full">
              Create Account
            </Button>
          </form>
        </div>
      </div>
    );
  },
};

export const SearchForm: Story = {
  render: () => {
    const [query, setQuery] = useState('');
    const [filters, setFilters] = useState({
      category: '',
      sortBy: 'relevance',
    });

    return (
      <div className="min-h-screen bg-cosmic p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gold-500 mb-8">Search</h1>

          <form className="space-y-6">
            <FormGroup label="Search Query">
              <Input
                type="search"
                placeholder="Search for services, readings, products..."
                value={query}
                onChange={setQuery}
              />
            </FormGroup>

            <div className="grid grid-cols-2 gap-6">
              <FormGroup label="Category">
                <Select
                  options={[
                    { label: 'All Categories', value: '' },
                    { label: 'Tarot', value: 'tarot' },
                    { label: 'Astrology', value: 'astrology' },
                    { label: 'Numerology', value: 'numerology' },
                    { label: 'Crystals', value: 'crystals' },
                  ]}
                  placeholder="Select category"
                  value={filters.category}
                  onChange={(val) => setFilters((prev) => ({ ...prev, category: val as string }))}
                />
              </FormGroup>

              <FormGroup label="Sort By">
                <Select
                  options={[
                    { label: 'Relevance', value: 'relevance' },
                    { label: 'Newest', value: 'newest' },
                    { label: 'Most Popular', value: 'popular' },
                    { label: 'Price: Low to High', value: 'price-asc' },
                    { label: 'Price: High to Low', value: 'price-desc' },
                  ]}
                  value={filters.sortBy}
                  onChange={(val) => setFilters((prev) => ({ ...prev, sortBy: val as string }))}
                />
              </FormGroup>
            </div>

            <Button type="submit" variant="primary" className="w-full">
              Search
            </Button>
          </form>
        </div>
      </div>
    );
  },
};

export const ContactForm: Story = {
  render: () => {
    const [formData, setFormData] = useState({
      name: '',
      email: '',
      subject: '',
      message: '',
    });
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
    };

    return (
      <div className="min-h-screen bg-cosmic p-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-gold-500 mb-8">Contact Us</h1>

          {submitted && (
            <div className="mb-6 p-4 bg-success/20 border border-success rounded text-success">
              Thank you for your message. We'll get back to you soon!
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <FormGroup label="Name" required>
              <Input
                type="text"
                placeholder="Your name"
                value={formData.name}
                onChange={(val) => setFormData((prev) => ({ ...prev, name: val }))}
              />
            </FormGroup>

            <FormGroup label="Email" required>
              <Input
                type="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={(val) => setFormData((prev) => ({ ...prev, email: val }))}
              />
            </FormGroup>

            <FormGroup label="Subject" required>
              <Input
                type="text"
                placeholder="What is this about?"
                value={formData.subject}
                onChange={(val) => setFormData((prev) => ({ ...prev, subject: val }))}
              />
            </FormGroup>

            <FormGroup label="Message" required>
              <Textarea
                placeholder="Your message..."
                value={formData.message}
                onChange={(val) => setFormData((prev) => ({ ...prev, message: val }))}
                rows={6}
              />
            </FormGroup>

            <Button type="submit" variant="primary" className="w-full">
              Send Message
            </Button>
          </form>
        </div>
      </div>
    );
  },
};

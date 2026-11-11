'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { LIMITS, PRODUCT_CATEGORIES } from '@/shared/constants';
import { CURRENCY_SYMBOL } from '@/shared/format';
import ExpiryDatePicker from './ExpiryDatePicker';
import { FormMessage } from './ProductPageShell';

const DESCRIPTION_ROWS = 4;
const PRICE_STEP = '0.01';

/** a11y wiring for a control and its error message. */
function controlProps(id, error) {
  return {
    id,
    'aria-invalid': Boolean(error) || undefined,
    'aria-describedby': error ? `${id}-error` : undefined,
  };
}

function Field({ id, label, required, error, children, className }) {
  return (
    <div className={cn('space-y-2', className)}>
      <Label htmlFor={id} className={cn(error && 'text-red-500')}>
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </Label>
      {children}
      {error && (
        <p id={`${id}-error`} className="text-sm text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}

/**
 * Product fields shared by the add and edit pages.
 * @param {ReturnType<import('./useProductForm').useProductForm>} props.form
 */
export default function ProductForm({ form, submitLabel, submittingLabel, successMessage, minExpiryDate }) {
  const { values, errors, formError, isSubmitting, succeeded, setField, handleChange, handleSubmit } = form;

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {formError && <FormMessage type="error">{formError}</FormMessage>}
      {succeeded && successMessage && <FormMessage type="success">{successMessage}</FormMessage>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Field id="name" label="Product Name" required error={errors.name}>
          <Input
            {...controlProps('name', errors.name)}
            value={values.name}
            onChange={handleChange}
            maxLength={LIMITS.NAME_MAX}
            className={cn(errors.name && 'border-red-500')}
          />
        </Field>

        <Field id="category" label="Category" required error={errors.category}>
          <Select value={values.category} onValueChange={(value) => setField('category', value)}>
            <SelectTrigger {...controlProps('category', errors.category)} className={cn(errors.category && 'border-red-500')}>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {PRODUCT_CATEGORIES.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field id="price" label="Price" required error={errors.price}>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true">
              {CURRENCY_SYMBOL}
            </span>
            <Input
              {...controlProps('price', errors.price)}
              type="number"
              inputMode="decimal"
              step={PRICE_STEP}
              min="0"
              max={LIMITS.MAX_PRICE}
              value={values.price}
              onChange={handleChange}
              className={cn('pl-7', errors.price && 'border-red-500')}
            />
          </div>
        </Field>

        <Field id="stock" label="Stock Quantity" required error={errors.stock}>
          <Input
            {...controlProps('stock', errors.stock)}
            type="number"
            inputMode="numeric"
            step="1"
            min="0"
            max={LIMITS.MAX_STOCK}
            value={values.stock}
            onChange={handleChange}
            className={cn(errors.stock && 'border-red-500')}
          />
        </Field>

        <Field id="expiryDate" label="Expiry Date" required error={errors.expiryDate}>
          <ExpiryDatePicker
            id="expiryDate"
            value={values.expiryDate}
            onChange={(date) => setField('expiryDate', date)}
            minDate={minExpiryDate}
            invalid={Boolean(errors.expiryDate)}
            describedBy={errors.expiryDate ? 'expiryDate-error' : undefined}
          />
        </Field>

        <Field id="barcode" label="Barcode" required error={errors.barcode}>
          <Input
            {...controlProps('barcode', errors.barcode)}
            value={values.barcode}
            onChange={handleChange}
            maxLength={LIMITS.BARCODE_MAX}
            autoComplete="off"
            className={cn(errors.barcode && 'border-red-500')}
          />
        </Field>
      </div>

      <Field id="description" label="Description" error={errors.description}>
        <Textarea
          {...controlProps('description', errors.description)}
          value={values.description}
          onChange={handleChange}
          maxLength={LIMITS.DESCRIPTION_MAX}
          rows={DESCRIPTION_ROWS}
        />
      </Field>

      <div className="pt-4">
        <Button
          type="submit"
          className="w-full bg-purple-600 hover:bg-purple-700 text-white"
          disabled={isSubmitting}
          aria-busy={isSubmitting}
        >
          {isSubmitting ? submittingLabel : submitLabel}
        </Button>
      </div>
    </form>
  );
}

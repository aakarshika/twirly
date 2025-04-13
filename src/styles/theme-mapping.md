# Theme Color Usage Guide

## Color Variables
- `primary`: Main brand color, used for primary actions and highlights
- `secondary`: Secondary brand color, used for accents and secondary actions
- `background`: Main background color
- `text`: Primary text color
- `card`: Background color for cards and elevated surfaces
- `border`: Color for borders and dividers

## Component Theme Mapping

### Layout Components

#### Header
- Background: `background`
- Text: `text`
- Border: `border`
- Logo: `primary`
- Navigation Links: `text`
- Active Link: `primary`
- Hover States: `primary` with opacity

#### Footer
- Background: `card`
- Text: `text`
- Links: `primary`
- Border: `border`

### Common Components

#### Button
- Primary Button:
  - Background: `primary`
  - Text: White
  - Hover: Darker shade of `primary`
- Secondary Button:
  - Background: `secondary`
  - Text: White
  - Hover: Darker shade of `secondary`
- Outline Button:
  - Border: `primary`
  - Text: `primary`
  - Hover: `primary` with opacity

#### Card
- Background: `card`
- Border: `border`
- Text: `text`
- Title: `text`
- Subtitle: `text` with opacity

#### Input
- Background: `background`
- Border: `border`
- Text: `text`
- Placeholder: `text` with opacity
- Focus Border: `primary`

### Comparison Components

#### ComparisonCard
- Background: `card`
- Border: `border`
- Title: `text`
- Stats: `primary`
- Vote Button: `primary`

#### ItemCard
- Background: `card`
- Border: `border`
- Title: `text`
- Description: `text` with opacity
- Price: `primary`

### Review Components

#### ReviewCard
- Background: `card`
- Border: `border`
- Username: `primary`
- Review Text: `text`
- Timestamp: `text` with opacity
- Like Button: `primary`

#### ReviewForm
- Background: `card`
- Border: `border`
- Input Fields: `background`
- Submit Button: `primary`

### Profile Components

#### UserInfo
- Background: `card`
- Avatar Border: `primary`
- Username: `text`
- Bio: `text` with opacity
- Stats: `primary`

#### ActivityTabs
- Tab Background: `card`
- Active Tab: `primary`
- Tab Text: `text`
- Content Background: `background`

### Company Components

#### CompanyHeader
- Background: `card`
- Logo Border: `primary`
- Company Name: `text`
- Industry: `text` with opacity
- Stats: `primary`

#### ProductCard
- Background: `card`
- Border: `border`
- Title: `text`
- Price: `primary`
- Category: `secondary`

## Theme Implementation Guidelines

1. **Use CSS Variables**
   ```css
   .component {
     background-color: var(--color-background);
     color: var(--color-text);
   }
   ```

2. **Use Theme Utility Classes**
   ```jsx
   <div className="bg-card text-primary">
     <h1 className="text-text">Title</h1>
   </div>
   ```

3. **Dynamic Styling**
   ```jsx
   const { currentTheme } = useTheme();
   <div style={{ backgroundColor: currentTheme.colors.background }}>
     <h1 style={{ color: currentTheme.colors.text }}>Title</h1>
   </div>
   ```

4. **Hover States**
   ```css
   .button:hover {
     background-color: color-mix(in srgb, var(--color-primary) 90%, white);
   }
   ```

5. **Transitions**
   ```css
   .component {
     transition: background-color 0.3s ease, color 0.3s ease;
   }
   ```

## Theme-Aware Component Checklist

When updating a component for theme support:

1. [ ] Replace hardcoded colors with theme variables
2. [ ] Add appropriate hover states
3. [ ] Implement transitions for smooth theme changes
4. [ ] Test with all available themes
5. [ ] Ensure proper contrast ratios
6. [ ] Document color usage in component comments 
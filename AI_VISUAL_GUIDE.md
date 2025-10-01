# AI OKR - Visual Implementation Guide

## 🎨 Visual Design Reference

This guide shows exactly how the AI features look and behave in your application.

---

## 1. AI Suggestions Button

### Location
In the "Key Result" section header, next to the "+ Key Result" dropdown button.

### Design
```
┌────────────────────────────────────────────────────┐
│ Key Result         [⚡ AI Suggestions]  [+ Key Result ▼] │
└────────────────────────────────────────────────────┘
```

### Styling
- **Type**: Ghost button (outlined)
- **Icon**: ⚡ ThunderboltFilled
- **Color**: Primary blue
- **State**: Disabled when objective title is empty
- **Hover**: Slight border color change

### Code
```tsx
<Button 
  type="primary" 
  ghost 
  icon={<ThunderboltFilled />}
  disabled={!objectiveTitle}
>
  AI Suggestions
</Button>
```

---

## 2. AI Suggestions Modal

### Modal Header
```
┌──────────────────────────────────────────────────────────┐
│  ⚡ AI Key Result Suggestions                        [✕]  │
└──────────────────────────────────────────────────────────┘
```

### Modal Content - Top Section
```
┌──────────────────────────────────────────────────────────┐
│  Objective:                                               │
│  Increase customer satisfaction by 20%                    │
│                                          [Regenerate]     │
│  ────────────────────────────────────────────────────    │
│  💡 AI will suggest key results with weights that sum    │
│     to 100%                                               │
└──────────────────────────────────────────────────────────┘
```

### Accordion Suggestions (Collapsed State)
```
┌──────────────────────────────────────────────────────────┐
│  > ⚡ AI Key Result Suggestion              [+ ]          │
├──────────────────────────────────────────────────────────┤
│  > ⚡ AI Key Result Suggestion              [+ ]          │
├──────────────────────────────────────────────────────────┤
│  > ⚡ AI Key Result Suggestion              [+ ]          │
└──────────────────────────────────────────────────────────┘
```

### Accordion Suggestions (One Expanded)
```
┌──────────────────────────────────────────────────────────┐
│  ∨ ⚡ AI Key Result Suggestion              [+ ]          │
│  ┌────────────────────────────────────────────────────┐  │
│  │                                                     │  │
│  │  Implement customer feedback system and track      │  │
│  │  satisfaction scores monthly                       │  │
│  │                                                     │  │
│  │  [Weight: 30%] [numeric] [Initial: 0] [Target: 100]│  │
│  └────────────────────────────────────────────────────┘  │
├──────────────────────────────────────────────────────────┤
│  > ⚡ AI Key Result Suggestion              [+ ]          │
├──────────────────────────────────────────────────────────┤
│  > ⚡ AI Key Result Suggestion              [+ ]          │
└──────────────────────────────────────────────────────────┘
```

### Modal Footer
```
┌──────────────────────────────────────────────────────────┐
│  Suggested Key Results: 3         Total Weight: 100%     │
└──────────────────────────────────────────────────────────┘
```

---

## 3. Color Scheme

### Panel Colors
```
Accordion Panel Border: #e5e7eb (gray-200)
Accordion Background:   #ffffff (white)
Hover State:           Slight shadow
```

### Icon Colors
```
⚡ ThunderboltFilled: #6366f1 (indigo-600)
```

### Tag Colors
```
┌─────────────┬──────────────┬─────────────────────┐
│ Tag Type    │ Background   │ Text Color          │
├─────────────┼──────────────┼─────────────────────┤
│ Weight      │ #EEF2FF      │ #6366f1 (indigo)    │
│ Type        │ #FDF4FF      │ #a855f7 (purple)    │
│ Initial     │ #F0FDFA      │ #14b8a6 (teal)      │
│ Target      │ #F0FDF4      │ #22c55e (green)     │
└─────────────┴──────────────┴─────────────────────┘
```

### Button Colors
```
Primary Button:
  Background: #2B3CF1 (blue)
  Hover:      #1d2bb8 (darker blue)
  Text:       white
  Height:     28px
  Padding:    0 12px
```

---

## 4. Tag Visual Reference

### Rounded Pill Tags
```
┌─────────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐
│ Weight: 30% │  │  numeric  │  │ Initial: 0│  │ Target: 100│
└─────────────┘  └───────────┘  └───────────┘  └───────────┘
   (Indigo)        (Purple)        (Teal)         (Green)
```

### Tag Specifications
- **Shape**: Fully rounded (rounded-full)
- **Border**: None
- **Font Size**: 12px (text-xs)
- **Font Weight**: 500 (medium)
- **Padding**: 2px 10px
- **Gap Between**: 8px (gap-2)

---

## 5. AI Indicator Banner

### When Added to Key Results List
```
┌──────────────────────────────────────────────────────────┐
│  ⚡ This is a Key Result from the AI                      │
└──────────────────────────────────────────────────────────┘
┌──────────────────────────────────────────────────────────┐
│  [Key Result Name]               [Milestone ▼]  [30] [%] │
│  [Set Milestone]                           [100] [%]  [×] │
│                                        [Add Milestone]    │
└──────────────────────────────────────────────────────────┘
```

### Banner Styling
```
Background: linear-gradient(to right, #EEF2FF, #DBEAFE)
Border:     1px solid #C7D2FE (indigo-200)
Padding:    8px 12px (px-3 py-2)
Margin:     16px 16px 8px 16px (mx-4 mt-4 mb-2)
Border Radius: 8px (rounded-lg)

Icon: ⚡ (14px, indigo-600)
Text: 12px, medium weight, indigo-700
```

---

## 6. Success Notification

### When Suggestion is Added
```
┌──────────────────────────────────────────────────────────┐
│  ✨ AI-suggested Key Result added successfully           │
│  All fields have been auto-filled from the suggestion.   │
└──────────────────────────────────────────────────────────┘
```

### Styling
- **Type**: Success (green)
- **Duration**: 4 seconds
- **Position**: Top-right
- **Icon**: ✨ Sparkles
- **Has Description**: Yes

---

## 7. Responsive Behavior

### Desktop (> 768px)
```
┌────────────────────────────────────────────────────────────┐
│  Objective                                                  │
│  [────────────────────────────────────────────────────]    │
│                                                              │
│  Key Result              [⚡ AI Suggestions] [+ Key Result ▼]│
│  ┌────────────────────────────────────────────────────┐    │
│  │ > ⚡ AI KR Suggestion              [+ ]             │    │
│  ├────────────────────────────────────────────────────┤    │
│  │ > ⚡ AI KR Suggestion              [+ ]             │    │
│  └────────────────────────────────────────────────────┘    │
└────────────────────────────────────────────────────────────┘
```

### Mobile (< 768px)
```
┌───────────────────────────────────┐
│  Objective                         │
│  [─────────────────────────────]  │
│                                    │
│  Key Result                        │
│  [⚡ AI Suggestions]               │
│  [+ ]                              │
│  ┌─────────────────────────────┐  │
│  │ > ⚡ AI Suggestion  [+ ]     │  │
│  ├─────────────────────────────┤  │
│  │ > ⚡ AI Suggestion  [+ ]     │  │
│  └─────────────────────────────┘  │
└───────────────────────────────────┘
```

---

## 8. Interaction States

### Button States

#### Normal State
```
┌────────────────────┐
│ ⚡ AI Suggestions  │
└────────────────────┘
Border: Solid
Opacity: 100%
```

#### Hover State
```
┌────────────────────┐
│ ⚡ AI Suggestions  │ ← Slight border color intensifies
└────────────────────┘
Cursor: pointer
```

#### Disabled State
```
┌────────────────────┐
│ ⚡ AI Suggestions  │ (grayed out)
└────────────────────┘
Opacity: 50%
Cursor: not-allowed
```

#### Loading State (during generation)
```
┌────────────────────┐
│ ⚡ Generating...   │ (with spinner)
└────────────────────┘
Button disabled
```

### Accordion States

#### Collapsed
```
> ⚡ AI Key Result Suggestion              [+ ]
  ↑ Click to expand
```

#### Expanded
```
∨ ⚡ AI Key Result Suggestion              [+ ]
  ↑ Click to collapse
  
  [Full suggestion details visible]
```

#### Hover (on collapsed)
```
> ⚡ AI Key Result Suggestion              [+ ]
  ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  Subtle shadow appears
```

---

## 9. Animation Behaviors

### Modal Open
```
Duration: 200ms
Effect: Fade in + slight scale up
Easing: ease-out
```

### Accordion Expand/Collapse
```
Duration: 200ms
Effect: Height transition
Easing: ease-in-out
Content: Fades in/out
```

### Tag Appearance
```
Effect: All tags appear at once
No stagger effect
```

### Success Notification
```
Appears: Slide in from right
Duration: 4 seconds
Disappears: Fade out
```

---

## 10. Loading States

### During Suggestion Generation
```
┌──────────────────────────────────────────────────────────┐
│                                                           │
│                      ⚙ Loading...                        │
│                                                           │
│                  (Large spinning icon)                    │
│                                                           │
└──────────────────────────────────────────────────────────┘
```

### Empty State (Before Generation)
```
┌──────────────────────────────────────────────────────────┐
│                                                           │
│                        📭                                 │
│                                                           │
│              Click "Generate" to get AI suggestions       │
│                                                           │
└──────────────────────────────────────────────────────────┘
```

### Empty State (No Objective)
```
┌──────────────────────────────────────────────────────────┐
│                                                           │
│                        📝                                 │
│                                                           │
│            Please enter an objective title first          │
│                                                           │
└──────────────────────────────────────────────────────────┘
```

---

## 11. Real Example Flow

### Step 1: User Enters Objective
```
Objective: [Improve developer productivity               ]
Alignment: [Select...                                   ▼]
Deadline:  [Select date                                  ]

Key Result                      [⚡ AI Suggestions] [+ Key Result ▼]
```

### Step 2: Click AI Suggestions
```
Modal Opens with 3 Suggestions:

> ⚡ AI Key Result Suggestion              [+ ]
> ⚡ AI Key Result Suggestion              [+ ]
> ⚡ AI Key Result Suggestion              [+ ]

Total: 3 suggestions, 100% weight
```

### Step 3: Expand First Suggestion
```
∨ ⚡ AI Key Result Suggestion              [+ ]
  
  Reduce average build time from 10 to 5 minutes
  
  [Weight: 33%] [numeric] [Initial: 10] [Target: 5]

> ⚡ AI Key Result Suggestion              [+ ]
> ⚡ AI Key Result Suggestion              [+ ]
```

### Step 4: Click Add Button
```
✅ Success notification appears
✅ Modal closes
✅ Key result appears in list:

┌──────────────────────────────────────────────────────────┐
│  ⚡ This is a Key Result from the AI                      │
├──────────────────────────────────────────────────────────┤
│  [Reduce average build time from 10 to 5 minutes]  [33%]│
│  [Numeric ▼]  Initial: [10]  Target: [5]            [×]  │
└──────────────────────────────────────────────────────────┘
```

---

## 12. Typography Specifications

```
┌─────────────────────────┬──────────┬────────┬───────────┐
│ Element                 │ Size     │ Weight │ Color     │
├─────────────────────────┼──────────┼────────┼───────────┤
│ Modal Title             │ 16px     │ 600    │ gray-900  │
│ Section Label           │ 14px     │ 500    │ gray-600  │
│ Objective Text          │ 16px     │ 500    │ gray-900  │
│ Panel Header            │ 14px     │ 500    │ gray-700  │
│ Suggestion Text         │ 14px     │ 400    │ gray-700  │
│ Tag Text                │ 12px     │ 500    │ Various   │
│ AI Banner Text          │ 12px     │ 500    │ indigo-700│
│ Button Text             │ 12px     │ 500    │ white     │
│ Footer Summary          │ 14px     │ 400    │ gray-600  │
└─────────────────────────┴──────────┴────────┴───────────┘
```

---

## 13. Spacing System

```
┌─────────────────────────┬──────────┬───────────────────┐
│ Element                 │ Value    │ Tailwind          │
├─────────────────────────┼──────────┼───────────────────┤
│ Panel Margin Bottom     │ 12px     │ mb-3              │
│ Panel Padding           │ 16px     │ px-4 pb-4         │
│ Tag Gap                 │ 8px      │ gap-2             │
│ Button Gap (in header)  │ 8px      │ gap-2             │
│ AI Banner Margin        │ 16px     │ mx-4 mt-4 mb-2    │
│ AI Banner Padding       │ 8px 12px │ px-3 py-2         │
│ Modal Padding           │ 32px     │ p-8               │
│ Section Margin Bottom   │ 16px     │ mb-4              │
└─────────────────────────┴──────────┴───────────────────┘
```

---

## 14. Accessibility Features

### Keyboard Navigation
```
Tab         → Focus next interactive element
Shift+Tab   → Focus previous element
Enter/Space → Click focused button
Arrow Keys  → Expand/collapse accordion panels
Esc         → Close modal
```

### Screen Reader Labels
```
Button: "AI Suggestions, generates key result suggestions"
Panel:  "AI Key Result Suggestion, expandable panel"
Icon:   "Lightning bolt icon indicating AI feature"
Banner: "This key result was generated by AI"
```

### Focus Indicators
```
All interactive elements show:
- Visible focus ring (outline)
- Color: Primary blue
- Width: 2px
- Offset: 2px
```

---

## 15. Error & Warning States

### Weight Overflow Warning
```
┌──────────────────────────────────────────────────────────┐
│  ⚠️ Cannot add this key result                            │
│  Current total weight is 80%. Adding 30% would exceed    │
│  100%.                                                    │
└──────────────────────────────────────────────────────────┘
```

### API Error
```
┌──────────────────────────────────────────────────────────┐
│  ❌ Failed to generate key result suggestions             │
│  Please try again or check your connection.              │
└──────────────────────────────────────────────────────────┘
```

### No Objective Warning
```
┌──────────────────────────────────────────────────────────┐
│  ⚠️ Please enter an objective title first                 │
└──────────────────────────────────────────────────────────┘
```

---

## 16. Comparison: Old vs New Design

### Old Design (Card-Based)
```
┌────────────────────────────────────────────────────────┐
│ Reduce build time from 10 to 5 minutes                 │
│                                                         │
│ [Weight: 33%] [Type: numeric] [Initial: 10] [Target: 5]│
│                                                         │
│                                           [Add Button]  │
└────────────────────────────────────────────────────────┘
↓ All suggestions always visible (takes more space)
```

### New Design (Accordion-Based)
```
> ⚡ AI Key Result Suggestion              [+ ]
↑ Collapsed by default (saves space)

Click to expand ↓

∨ ⚡ AI Key Result Suggestion              [+ ]
  ┌──────────────────────────────────────────────────┐
  │ Reduce build time from 10 to 5 minutes          │
  │ [Weight: 33%] [numeric] [Initial: 10] [Target: 5]│
  └──────────────────────────────────────────────────┘
```

---

## 🎯 Quick Visual Checklist

When implementing, verify these visual elements:

### Modal
- [ ] ⚡ Icon in header (indigo color)
- [ ] "Generate/Regenerate" button (top right)
- [ ] Blue info box with 💡 icon
- [ ] Clean white background
- [ ] Proper padding (32px on desktop)

### Accordion Panels
- [ ] Collapsed by default
- [ ] ⚡ Icon (16px, indigo)
- [ ] "AI Key Result Suggestion" text
- [ ] "+ " button (blue, small, in header)
- [ ] Gray border (#e5e7eb)
- [ ] White background
- [ ] Smooth expand/collapse animation

### Tags
- [ ] Rounded pill shape (fully rounded)
- [ ] No borders
- [ ] Custom background colors
- [ ] Proper text colors
- [ ] 8px gap between tags
- [ ] 12px font size

### AI Banner
- [ ] Gradient background (indigo-50 to blue-50)
- [ ] ⚡ Icon (14px, indigo-600)
- [ ] "This is a Key Result from the AI" text
- [ ] Appears above key result form
- [ ] Indigo border

### Buttons
- [ ] Primary button color (#2B3CF1)
- [ ] Proper hover state
- [ ] Icon + text alignment
- [ ] Correct sizing (28px height for small)

---

## 📱 Mobile Considerations

### Touch Targets
```
Minimum touch target: 44px × 44px
Button height: 28px (in headers)
Panel headers: Full width (easy to tap)
```

### Responsive Breakpoints
```
< 768px: Mobile layout (full width)
≥ 768px: Desktop layout (800px modal width)
```

### Mobile-Specific Adjustments
```
- Wider tap areas
- Larger buttons on mobile
- Full-width modals
- Adjusted padding (12px vs 32px)
- Vertical button stacking if needed
```

---

**Status**: ✅ Complete Visual Reference Guide

**Use this guide to**:
- Verify implementation matches design
- Debug visual issues
- Maintain consistent styling
- Communicate with design team
- Onboard new developers




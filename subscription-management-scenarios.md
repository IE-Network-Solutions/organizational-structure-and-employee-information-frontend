## [1. Subscription Management Scenarios](https://lobster.stoplight.io/docs/api-docs/branches/master/5db4ba2e144b4-1-subscription-management-scenarios#1-subscription-management-scenarios)

### [1.1. Creating a New Subscription](https://lobster.stoplight.io/docs/api-docs/branches/master/5db4ba2e144b4-1-subscription-management-scenarios#11-creating-a-new-subscription)

#### [Process (initiated by API request):](https://lobster.stoplight.io/docs/api-docs/branches/master/5db4ba2e144b4-1-subscription-management-scenarios#process-initiated-by-api-request)

1. System validates:

   - Client has no other subscriptions in any status (active, expired, trial, etc.) - client can have only one subscription in the system
   - Client has no unpaid invoices

2. System receives data for new subscription creation:

   - Client ID (tenantId)
   - Plan ID (planId)
   - Plan Period ID (planPeriodId) - identifies which period option is selected for the plan
   - Number of slots (slotTotal)

3. System validates plan and period:

   - Plan exists in `subscription_module.plans` table
   - Plan has no `deletedAt` (not deleted)
   - Plan has `isPublic` = true (if request from client)
   - Selected planPeriodId belongs to the specified plan
   - If plan has trial period (trialDurationDays is not null) and maxTrialSlots is set, verify requested slots don't exceed this limit

4. System retrieves period information:

   - Gets period type details from `subscription_module.periodTypes` via `subscription_module.planPeriods`
   - Calculates actual subscription duration based on periodTypeId and periodMultiplier

5. System creates record in `subscription_module.subscriptions`:

   - `id` = generated UUID
   - `tenantId` = client ID
   - `planId` = selected plan ID
   - `planPeriodId` = selected plan period ID
   - `startAt` = current date and time
   - `endAt` = startAt + calculated period duration
   - `isActive` = true (for regular subscription) or false (for trial, until paid)
   - `slotTotal` = requested number of slots
   - `subscriptionPrice` = calculated price:
     **// Determine effective slot price**

     **if (planPeriod.periodSlotPrice IS NOT NULL) {**

     **// Use period-specific price if defined**

     **if (planPeriod.periodSlotDiscountPrice IS NOT NULL) {**

     **effectiveSlotPrice = planPeriod.periodSlotDiscountPrice**

     **} else if (planPeriod.discountPercentage IS NOT NULL) {**

     **effectiveSlotPrice = planPeriod.periodSlotPrice \* (1 - planPeriod.discountPercentage / 100)**

     **} else {**

     **effectiveSlotPrice = planPeriod.periodSlotPrice**

     **}**

     **} else {**

     **// Fall back to plan-level pricing**

     **if (plan.slotDiscountPrice IS NOT NULL) {**

     **effectiveSlotPrice = plan.slotDiscountPrice**

     **} else {**

     **effectiveSlotPrice = plan.slotPrice**

     **}**

     **// Apply period discount if defined**

     **if (planPeriod.discountPercentage IS NOT NULL) {**

     **effectiveSlotPrice = effectiveSlotPrice \* (1 - planPeriod.discountPercentage / 100)**

     **}**

     **}**

     **totalPrice = effectiveSlotPrice × slotTotal × planPeriod.periodMultiplier**

   - `isTrial` = plan.trialDurationDays IS NOT NULL
   - `subscriptionStatus` = plan.trialDurationDays IS NOT NULL ? 'trial' : 'active'
   - `scheduledChangesMetadata` = null

   If plan has trial period:

   - `trialEndAt` = startAt + plan.trialDurationDays

6. System creates record in `subscription_module.subscriptionSlotTransactions` for initial slot count:

   - `subscriptionId` = ID created subscription
   - `transactionType` = subscription.isTrial ? 'trial' : 'purchase'
   - `slotCount` = requested number of slots
   - `pricePerSlot` = subscription.isTrial ? 0 : slot price with discount
   - `effectiveAt` = subscription start date
   - `transactionAt` = current date and time
   - `status` = subscription.isTrial ? 'completed' : 'pending' // Trial slots are immediately active, regular - after payment
   - `reason` = subscription.isTrial ? 'Trial subscription slots' : 'Initial subscription slots'

7. Creates audit log record in `subscription_module.auditLogs`:

   - `entity` = 'subscription'
   - `entityId` = ID created subscription
   - `action` = 'created'
   - `details` = JSON with main subscription parameters
   - `actionAt` = current date and time

8. If subscription is not in trial period or it's free plan (`isFree` = true), system creates invoice:

   - `tenantId` = client ID
   - `subscriptionId` = ID created subscription
   - `invoiceNumber` = generated unique number
   - `invoiceType` = 'new'
   - `status` = 'pending'
   - `invoiceAt` = current date and time
   - `dueAt` = subscription end date // Payment due date set to end of subscription period
   - `totalAmount` = subscription calculated price
   - `currencyId` = ID base currency
   - `paymentMetadata` = standardized JSON:
     <pre tabindex="0" class="sl-code-viewer sl-grid sl-inverted sl-overflow-x-hidden sl-overflow-y-hidden sl-relative sl-bg-canvas sl-outline-none sl-rounded-lg focus:sl-ring sl-ring-primary sl-ring-opacity-50 sl-group" role="group"><div class="sl-code-viewer__scroller sl-overflow-x-auto sl-overflow-y-auto"><div class="sl-code-highlight prism-code language-json"><div class="sl-flex"><div class="sl-flex-1 sl-break-all"><span class="token punctuation">{</span><span class="token plain"></span></div></div><div class="sl-flex"><div class="sl-flex-1 sl-break-all"><span class="token plain"></span><span class="token property">"operationType"</span><span class="token operator">:</span><span class="token plain"></span><span class="token string">"new_subscription"</span><span class="token punctuation">,</span><span class="token plain"></span></div></div><div class="sl-flex"><div class="sl-flex-1 sl-break-all"><span class="token plain"></span><span class="token property">"targetState"</span><span class="token operator">:</span><span class="token plain"></span><span class="token punctuation">{</span><span class="token plain"></span></div></div><div class="sl-flex"><div class="sl-flex-1 sl-break-all"><span class="token plain"></span><span class="token property">"subscriptionId"</span><span class="token operator">:</span><span class="token plain"></span><span class="token string">"[ID_subscription]"</span><span class="token punctuation">,</span><span class="token plain"></span></div></div><div class="sl-flex"><div class="sl-flex-1 sl-break-all"><span class="token plain"></span><span class="token property">"planId"</span><span class="token operator">:</span><span class="token plain"></span><span class="token string">"[ID_plan]"</span><span class="token punctuation">,</span><span class="token plain"></span></div></div><div class="sl-flex"><div class="sl-flex-1 sl-break-all"><span class="token plain"></span><span class="token property">"slotTotal"</span><span class="token operator">:</span><span class="token plain"></span><span class="token string">"[number_of_slots]"</span><span class="token punctuation">,</span><span class="token plain"></span></div></div><div class="sl-flex"><div class="sl-flex-1 sl-break-all"><span class="token plain"></span><span class="token property">"startAt"</span><span class="token operator">:</span><span class="token plain"></span><span class="token string">"[start_date]"</span><span class="token punctuation">,</span><span class="token plain"></span></div></div><div class="sl-flex"><div class="sl-flex-1 sl-break-all"><span class="token plain"></span><span class="token property">"endAt"</span><span class="token operator">:</span><span class="token plain"></span><span class="token string">"[end_date]"</span><span class="token punctuation">,</span><span class="token plain"></span></div></div><div class="sl-flex"><div class="sl-flex-1 sl-break-all"><span class="token plain"></span><span class="token property">"price"</span><span class="token operator">:</span><span class="token plain"></span><span class="token string">"[subscription_price]"</span><span class="token punctuation">,</span><span class="token plain"></span></div></div><div class="sl-flex"><div class="sl-flex-1 sl-break-all"><span class="token plain"></span><span class="token property">"isActive"</span><span class="token operator">:</span><span class="token plain"></span><span class="token boolean">true</span><span class="token plain"></span></div></div><div class="sl-flex"><div class="sl-flex-1 sl-break-all"><span class="token plain"></span><span class="token punctuation">}</span><span class="token plain"></span></div></div><div class="sl-flex"><div class="sl-flex-1 sl-break-all"><span class="token plain"></span><span class="token punctuation">}</span></div></div></div></div><div data-testid="copy-button" class="sl-absolute sl-right-0 sl-pr-2 sl-invisible group-hover:sl-visible sl-invisible"><button type="button" class="sl-button sl-form-group-border sl-h-sm sl-text-base sl-font-medium sl-px-1.5 hover:sl-bg-canvas-50 active:sl-bg-canvas-100 sl-text-muted hover:sl-text-body focus:sl-text-body sl-rounded sl-border-transparent sl-border disabled:sl-opacity-70"><div class="sl-mx-0"><i role="img" aria-hidden="true" class="sl-icon fal fa-copy fa-fw fa-sm"></i></div></button></div></pre>

9. After invoice paid:

   - Updates invoice status to 'paid'
   - Updates subscription status to 'active'
   - Sets `isActive` = true for subscription
   - Updates slot transaction status to 'completed'
   - Records payment information in payments table
   - Creates audit log record about successful subscription activation

#### [1.1.1. Creating a New Subscription by Administrator](https://lobster.stoplight.io/docs/api-docs/branches/master/5db4ba2e144b4-1-subscription-management-scenarios#111-creating-a-new-subscription-by-administrator)

Process (initiated through admin panel):

1. Administrator selects tenant for which subscription is created and specifies:
   - Client ID (tenantId)
   - Plan ID (planId)
   - Plan Period ID (planPeriodId)
   - Number of slots (slotTotal)
2. Features:
   - Creation process is identical to tenant's own subscription creation process
   - Administrator can create subscription for any plan, including hidden or deleted
   - All administrator actions are fully recorded in audit log

### [1.2. Plan Level Increase (Upgrade)](https://lobster.stoplight.io/docs/api-docs/branches/master/5db4ba2e144b4-1-subscription-management-scenarios#12-plan-level-increase-upgrade)

#### [Process (initiated by API request):](https://lobster.stoplight.io/docs/api-docs/branches/master/5db4ba2e144b4-1-subscription-management-scenarios#process-initiated-by-api-request-1)

#### [The process of decreasing or increasing is essentially the same, but depends on the cost of the subscription to which the transition is made](https://lobster.stoplight.io/docs/api-docs/branches/master/5db4ba2e144b4-1-subscription-management-scenarios#the-process-of-decreasing-or-increasing-is-essentially-the-same-but-depends-on-the-cost-of-the-subscription-to-which-the-transition-is-made)

1. System validates:

   - Current subscription is active (`isActive` = true)
   - Client has no unpaid invoices of any type (all invoices must have status 'paid')
   - New plan exists and is valid (not deleted)
   - New plan has higher slot price than current

2. If client has unpaid invoices:

   - System rejects operation
   - Returns message "Cannot upgrade plan when there are unpaid bills. Please pay all current bills or contact support."

3. Calculates proportional upgrade cost:
   **days_remaining = (subscription.endAt - current_date).days**

   **days_total = (subscription.endAt - subscription.startAt).days**

   **period_share = days_remaining / days_total**

   **// Get current effective slot price**

   **if (current_planPeriod.periodSlotPrice IS NOT NULL) {**

   **if (current_planPeriod.periodSlotDiscountPrice IS NOT NULL) {**

   **current_slot_price = current_planPeriod.periodSlotDiscountPrice**

   **} else if (current_planPeriod.discountPercentage IS NOT NULL) {**

   **current_slot_price = current_planPeriod.periodSlotPrice \* (1 - current_planPeriod.discountPercentage / 100)**

   **} else {**

   **current_slot_price = current_planPeriod.periodSlotPrice**

   **}**

   **} else {**

   **current_slot_price = current_plan.slotDiscountPrice !== null**

   **? current_plan.slotDiscountPrice**

   **: current_plan.slotPrice**

   **if (current_planPeriod.discountPercentage IS NOT NULL) {**

   **current_slot_price = current_slot_price \* (1 - current_planPeriod.discountPercentage / 100)**

   **}**

   **}**

   **// Get new effective slot price**

   **if (new_planPeriod.periodSlotPrice IS NOT NULL) {**

   **if (new_planPeriod.periodSlotDiscountPrice IS NOT NULL) {**

   **new_slot_price = new_planPeriod.periodSlotDiscountPrice**

   **} else if (new_planPeriod.discountPercentage IS NOT NULL) {**

   **new_slot_price = new_planPeriod.periodSlotPrice \* (1 - new_planPeriod.discountPercentage / 100)**

   **} else {**

   **new_slot_price = new_planPeriod.periodSlotPrice**

   **}**

   **} else {**

   **new_slot_price = new_plan.slotDiscountPrice !== null**

   **? new_plan.slotDiscountPrice**

   **: new_plan.slotPrice**

   **if (new_planPeriod.discountPercentage IS NOT NULL) {**

   **new_slot_price = new_slot_price \* (1 - new_planPeriod.discountPercentage / 100)**

   **}**

   **}**

   **current*plan_cost_for_period = current_slot_price * subscription.slotTotal \_ current_planPeriod.periodMultiplier**

   **current_cost_for_remaining_days = current_plan_cost_for_period \* period_share**

   **new*plan_cost_for_full_period = new_slot_price * subscription.slotTotal \_ new_planPeriod.periodMultiplier**

   **new_cost_for_remaining_days = new_plan_cost_for_full_period \* period_share**

   **additional_cost = new_cost_for_remaining_days - current_cost_for_remaining_days**

4. Creates invoice in `subscription_module.invoices`:

   - `tenantId` = client ID
   - `subscriptionId` = ID current subscription
   - `invoiceNumber` = generated unique number (format: UPG-YYYYMMDD-XXXX)
   - `invoiceType` = 'upgrade'
   - `status` = 'pending'
   - `invoiceAt` = current date and time
   - `dueAt` = current_subscription.endAt // Payment due date coincides with end of current subscription period
   - `totalAmount` = calculated additional cost
   - `currencyId` = ID base currency
   - `notes` = information about plan transition
   - `paymentMetadata` = standardized JSON:
     <pre tabindex="0" class="sl-code-viewer sl-grid sl-inverted sl-overflow-x-hidden sl-overflow-y-hidden sl-relative sl-bg-canvas sl-outline-none sl-rounded-lg focus:sl-ring sl-ring-primary sl-ring-opacity-50 sl-group" role="group"><div class="sl-code-viewer__scroller sl-overflow-x-auto sl-overflow-y-auto"><div class="sl-code-highlight prism-code language-json"><div class="sl-flex"><div class="sl-flex-1 sl-break-all"><span class="token punctuation">{</span><span class="token plain"></span></div></div><div class="sl-flex"><div class="sl-flex-1 sl-break-all"><span class="token plain"></span><span class="token property">"operationType"</span><span class="token operator">:</span><span class="token plain"></span><span class="token string">"plan_upgrade"</span><span class="token punctuation">,</span><span class="token plain"></span></div></div><div class="sl-flex"><div class="sl-flex-1 sl-break-all"><span class="token plain"></span><span class="token property">"previousState"</span><span class="token operator">:</span><span class="token plain"></span><span class="token punctuation">{</span><span class="token plain"></span></div></div><div class="sl-flex"><div class="sl-flex-1 sl-break-all"><span class="token plain"></span><span class="token property">"planId"</span><span class="token operator">:</span><span class="token plain"></span><span class="token string">"[ID_current_plan]"</span><span class="token punctuation">,</span><span class="token plain"></span></div></div><div class="sl-flex"><div class="sl-flex-1 sl-break-all"><span class="token plain"></span><span class="token property">"slotTotal"</span><span class="token operator">:</span><span class="token plain"></span><span class="token string">"[number_of_slots]"</span><span class="token punctuation">,</span><span class="token plain"></span></div></div><div class="sl-flex"><div class="sl-flex-1 sl-break-all"><span class="token plain"></span><span class="token property">"price"</span><span class="token operator">:</span><span class="token plain"></span><span class="token string">"[current_subscription_cost]"</span><span class="token plain"></span></div></div><div class="sl-flex"><div class="sl-flex-1 sl-break-all"><span class="token plain"></span><span class="token punctuation">}</span><span class="token punctuation">,</span><span class="token plain"></span></div></div><div class="sl-flex"><div class="sl-flex-1 sl-break-all"><span class="token plain"></span><span class="token property">"targetState"</span><span class="token operator">:</span><span class="token plain"></span><span class="token punctuation">{</span><span class="token plain"></span></div></div><div class="sl-flex"><div class="sl-flex-1 sl-break-all"><span class="token plain"></span><span class="token property">"planId"</span><span class="token operator">:</span><span class="token plain"></span><span class="token string">"[ID_new_plan]"</span><span class="token punctuation">,</span><span class="token plain"></span></div></div><div class="sl-flex"><div class="sl-flex-1 sl-break-all"><span class="token plain"></span><span class="token property">"slotTotal"</span><span class="token operator">:</span><span class="token plain"></span><span class="token string">"[number_of_slots]"</span><span class="token punctuation">,</span><span class="token plain"></span></div></div><div class="sl-flex"><div class="sl-flex-1 sl-break-all"><span class="token plain"></span><span class="token property">"price"</span><span class="token operator">:</span><span class="token plain"></span><span class="token string">"[new_subscription_cost]"</span><span class="token plain"></span></div></div><div class="sl-flex"><div class="sl-flex-1 sl-break-all"><span class="token plain"></span><span class="token punctuation">}</span><span class="token punctuation">,</span><span class="token plain"></span></div></div><div class="sl-flex"><div class="sl-flex-1 sl-break-all"><span class="token plain"></span><span class="token property">"effectiveDate"</span><span class="token operator">:</span><span class="token plain"></span><span class="token string">"[date_of_changes_application]"</span><span class="token plain"></span></div></div><div class="sl-flex"><div class="sl-flex-1 sl-break-all"><span class="token plain"></span><span class="token punctuation">}</span></div></div></div></div><div data-testid="copy-button" class="sl-absolute sl-right-0 sl-pr-2 sl-invisible group-hover:sl-visible sl-invisible"><button type="button" class="sl-button sl-form-group-border sl-h-sm sl-text-base sl-font-medium sl-px-1.5 hover:sl-bg-canvas-50 active:sl-bg-canvas-100 sl-text-muted hover:sl-text-body focus:sl-text-body sl-rounded sl-border-transparent sl-border disabled:sl-opacity-70"><div class="sl-mx-0"><i role="img" aria-hidden="true" class="sl-icon fal fa-copy fa-fw fa-sm"></i></div></button></div></pre>

5. After invoice paid:

   - Gets metadata from paymentMetadata field
   - Updates subscription record in `subscription_module.subscriptions`:
     - `planId` = ID new plan
     - `subscriptionPrice` = new subscription cost
     - `updatedAt` = current date and time
   - Records information in audit log

#### [1.2.1. Plan Level Increase by Administrator](https://lobster.stoplight.io/docs/api-docs/branches/master/5db4ba2e144b4-1-subscription-management-scenarios#121-plan-level-increase-by-administrator)

Process (initiated through admin panel):

1. Administrator selects tenant for which subscription is upgraded and specifies:
   - Client ID (tenantId)
   - Plan ID (planId)
2. Features:
   - Creation process is identical to process of upgrading subscription by user
   - Administrator can change subscription to any plan, including hidden or deleted
   - All administrator actions are fully recorded in audit log

### [1.3. Plan Level Decrease or Slot Reduction](https://lobster.stoplight.io/docs/api-docs/branches/master/5db4ba2e144b4-1-subscription-management-scenarios#13-plan-level-decrease-or-slot-reduction)

#### [Process (initiated by API request):](https://lobster.stoplight.io/docs/api-docs/branches/master/5db4ba2e144b4-1-subscription-management-scenarios#process-initiated-by-api-request-2)

#### [The process of decreasing or increasing is essentially the same, but depends on the cost of the subscription to which the transition is made](https://lobster.stoplight.io/docs/api-docs/branches/master/5db4ba2e144b4-1-subscription-management-scenarios#the-process-of-decreasing-or-increasing-is-essentially-the-same-but-depends-on-the-cost-of-the-subscription-to-which-the-transition-is-made-1)

1. System validates:
   - Current subscription is active (`isActive` = true)
   - Client has no unpaid invoices of any type (all invoices must have status 'paid')
   - If specified new plan, it exists and is valid
   - If specified new number of slots, it's greater than zero and less than current number
2. If client has unpaid invoices:
   - System rejects operation
   - Returns message "Cannot change subscription when there are unpaid bills. Please pay all current bills or contact support."
3. System updates subscription record in `subscription_module.subscriptions`:
   - `scheduledChangesMetadata` = JSON with information about planned changes:
     <pre tabindex="0" class="sl-code-viewer sl-grid sl-inverted sl-overflow-x-hidden sl-overflow-y-hidden sl-relative sl-bg-canvas sl-outline-none sl-rounded-lg focus:sl-ring sl-ring-primary sl-ring-opacity-50 sl-group" role="group"><div class="sl-code-viewer__scroller sl-overflow-x-auto sl-overflow-y-auto"><div class="sl-code-highlight prism-code language-json"><div class="sl-flex"><div class="sl-flex-1 sl-break-all"><span class="token punctuation">{</span><span class="token plain"></span></div></div><div class="sl-flex"><div class="sl-flex-1 sl-break-all"><span class="token plain"></span><span class="token property">"effectiveAt"</span><span class="token operator">:</span><span class="token plain"></span><span class="token string">"current_subscription_end_date"</span><span class="token punctuation">,</span><span class="token plain"></span></div></div><div class="sl-flex"><div class="sl-flex-1 sl-break-all"><span class="token plain"></span><span class="token property">"changes"</span><span class="token operator">:</span><span class="token plain"></span><span class="token punctuation">{</span><span class="token plain"></span></div></div><div class="sl-flex"><div class="sl-flex-1 sl-break-all"><span class="token plain"></span><span class="token property">"newPlanId"</span><span class="token operator">:</span><span class="token plain"></span><span class="token string">"[ID_new_plan]"</span><span class="token punctuation">,</span><span class="token plain"></span><span class="token comment">// or null, if plan doesn't change</span><span class="token plain"></span></div></div><div class="sl-flex"><div class="sl-flex-1 sl-break-all"><span class="token plain"></span><span class="token property">"newSlotTotal"</span><span class="token operator">:</span><span class="token plain"></span><span class="token string">"[new_number_of_slots]"</span><span class="token punctuation">,</span><span class="token plain"></span><span class="token comment">// or null, if number doesn't change</span><span class="token plain"></span></div></div><div class="sl-flex"><div class="sl-flex-1 sl-break-all"><span class="token plain"></span><span class="token property">"createdAt"</span><span class="token operator">:</span><span class="token plain"></span><span class="token string">"[current_date_and_time]"</span><span class="token plain"></span></div></div><div class="sl-flex"><div class="sl-flex-1 sl-break-all"><span class="token plain"></span><span class="token punctuation">}</span><span class="token plain"></span></div></div><div class="sl-flex"><div class="sl-flex-1 sl-break-all"><span class="token plain"></span><span class="token punctuation">}</span></div></div></div></div><div data-testid="copy-button" class="sl-absolute sl-right-0 sl-pr-2 sl-invisible group-hover:sl-visible sl-invisible"><button type="button" class="sl-button sl-form-group-border sl-h-sm sl-text-base sl-font-medium sl-px-1.5 hover:sl-bg-canvas-50 active:sl-bg-canvas-100 sl-text-muted hover:sl-text-body focus:sl-text-body sl-rounded sl-border-transparent sl-border disabled:sl-opacity-70"><div class="sl-mx-0"><i role="img" aria-hidden="true" class="sl-icon fal fa-copy fa-fw fa-sm"></i></div></button></div></pre>
4. If planned is slot reduction, system creates record in `subscription_module.subscriptionSlotTransactions`:
   - `subscriptionId` = ID current subscription
   - `transactionType` = 'removal'
   - `slotCount` = (new_number_of_slots - current_number_of_slots) (negative number)
   - `effectiveAt` = date of end of current period
   - `status` = 'pending' // Status will be changed to 'completed' when new subscription is created for next period
   - `paymentMetadata` = standardized JSON:
     <pre tabindex="0" class="sl-code-viewer sl-grid sl-inverted sl-overflow-x-hidden sl-overflow-y-hidden sl-relative sl-bg-canvas sl-outline-none sl-rounded-lg focus:sl-ring sl-ring-primary sl-ring-opacity-50 sl-group" role="group"><div class="sl-code-viewer__scroller sl-overflow-x-auto sl-overflow-y-auto"><div class="sl-code-highlight prism-code language-json"><div class="sl-flex"><div class="sl-flex-1 sl-break-all"><span class="token punctuation">{</span><span class="token plain"></span></div></div><div class="sl-flex"><div class="sl-flex-1 sl-break-all"><span class="token plain"></span><span class="token property">"operationType"</span><span class="token operator">:</span><span class="token plain"></span><span class="token string">"slot_reduction"</span><span class="token punctuation">,</span><span class="token plain"></span></div></div><div class="sl-flex"><div class="sl-flex-1 sl-break-all"><span class="token plain"></span><span class="token property">"previousState"</span><span class="token operator">:</span><span class="token plain"></span><span class="token punctuation">{</span><span class="token plain"></span></div></div><div class="sl-flex"><div class="sl-flex-1 sl-break-all"><span class="token plain"></span><span class="token property">"slotTotal"</span><span class="token operator">:</span><span class="token plain"></span><span class="token string">"[current_number_of_slots]"</span><span class="token plain"></span></div></div><div class="sl-flex"><div class="sl-flex-1 sl-break-all"><span class="token plain"></span><span class="token punctuation">}</span><span class="token punctuation">,</span><span class="token plain"></span></div></div><div class="sl-flex"><div class="sl-flex-1 sl-break-all"><span class="token plain"></span><span class="token property">"targetState"</span><span class="token operator">:</span><span class="token plain"></span><span class="token punctuation">{</span><span class="token plain"></span></div></div><div class="sl-flex"><div class="sl-flex-1 sl-break-all"><span class="token plain"></span><span class="token property">"slotTotal"</span><span class="token operator">:</span><span class="token plain"></span><span class="token string">"[new_number_of_slots]"</span><span class="token plain"></span></div></div><div class="sl-flex"><div class="sl-flex-1 sl-break-all"><span class="token plain"></span><span class="token punctuation">}</span><span class="token punctuation">,</span><span class="token plain"></span></div></div><div class="sl-flex"><div class="sl-flex-1 sl-break-all"><span class="token plain"></span><span class="token property">"effectiveDate"</span><span class="token operator">:</span><span class="token plain"></span><span class="token string">"[subscription_end_date]"</span><span class="token plain"></span></div></div><div class="sl-flex"><div class="sl-flex-1 sl-break-all"><span class="token plain"></span><span class="token punctuation">}</span></div></div></div></div><div data-testid="copy-button" class="sl-absolute sl-right-0 sl-pr-2 sl-invisible group-hover:sl-visible sl-invisible"><button type="button" class="sl-button sl-form-group-border sl-h-sm sl-text-base sl-font-medium sl-px-1.5 hover:sl-bg-canvas-50 active:sl-bg-canvas-100 sl-text-muted hover:sl-text-body focus:sl-text-body sl-rounded sl-border-transparent sl-border disabled:sl-opacity-70"><div class="sl-mx-0"><i role="img" aria-hidden="true" class="sl-icon fal fa-copy fa-fw fa-sm"></i></div></button></div></pre>

#### [1.3.1. Plan Level Decrease by Administrator](https://lobster.stoplight.io/docs/api-docs/branches/master/5db4ba2e144b4-1-subscription-management-scenarios#131-plan-level-decrease-by-administrator)

Process (initiated through admin panel):

1. Administrator selects tenant for which subscription is decreased and specifies:
   - Client ID (tenantId)
   - Plan ID (planId)
2. Features:
   - Creation process is identical to process of decreasing subscription by user
   - Administrator can change subscription to any plan, including hidden or deleted
   - All administrator actions are fully recorded in audit log
3. System creates audit log record about planned change.

### [1.4. Buying Additional Slots](https://lobster.stoplight.io/docs/api-docs/branches/master/5db4ba2e144b4-1-subscription-management-scenarios#14-buying-additional-slots)

#### [Process (initiated by API request):](https://lobster.stoplight.io/docs/api-docs/branches/master/5db4ba2e144b4-1-subscription-management-scenarios#process-initiated-by-api-request-3)

1. System validates:

   - Current subscription is active (`isActive` = true and `subscriptionStatus` = 'active')
   - Client has no unpaid invoices of any type (all invoices must have status 'paid')
   - Number of additional slots is greater than zero

2. If client has unpaid invoices:

   - System rejects operation
   - Returns message "Cannot add slots when there are unpaid bills. Please pay all current bills or contact support."

3. Calculates proportional cost of additional slots:
   **days_remaining = (subscription.endAt - current_date).days**

   **days_total = (subscription.endAt - subscription.startAt).days**

   **period_share = days_remaining / days_total**

   **plan = get_plan(subscription.planId)**

   **planPeriod = get_plan_period(subscription.planPeriodId)**

   **// Determine effective slot price**

   **if (planPeriod.periodSlotPrice IS NOT NULL) {**

   **if (planPeriod.periodSlotDiscountPrice IS NOT NULL) {**

   **slot_price = planPeriod.periodSlotDiscountPrice**

   **} else if (planPeriod.discountPercentage IS NOT NULL) {**

   **slot_price = planPeriod.periodSlotPrice \* (1 - planPeriod.discountPercentage / 100)**

   **} else {**

   **slot_price = planPeriod.periodSlotPrice**

   **}**

   **} else {**

   **slot_price = plan.slotDiscountPrice !== null**

   **? plan.slotDiscountPrice**

   **: plan.slotPrice**

   **if (planPeriod.discountPercentage IS NOT NULL) {**

   **slot_price = slot_price \* (1 - planPeriod.discountPercentage / 100)**

   **}**

   **}**

   **additional*slots_cost = slot_price * number*of_additional_slots * period_share**

4. System creates preliminary record in `subscription_module.subscriptionSlotTransactions`:

   - `subscriptionId` = ID subscription
   - `transactionType` = 'purchase'
   - `slotCount` = number of slots to add
   - `pricePerSlot` = slot_price \* period_share
   - `effectiveAt` = current date and time
   - `status` = 'pending' // Status will be changed to 'completed' after invoice payment

5. System creates invoice in `subscription_module.invoices`:

   - `tenantId` = client ID
   - `subscriptionId` = ID current subscription
   - `invoiceNumber` = generated unique number (format: TOP-YYYYMMDD-XXXX)
   - `invoiceType` = 'topup'
   - `status` = 'pending'
   - `totalAmount` = additional_slots_cost
   - `paymentMetadata` = standardized JSON:
     <pre tabindex="0" class="sl-code-viewer sl-grid sl-inverted sl-overflow-x-hidden sl-overflow-y-hidden sl-relative sl-bg-canvas sl-outline-none sl-rounded-lg focus:sl-ring sl-ring-primary sl-ring-opacity-50 sl-group" role="group"><div class="sl-code-viewer__scroller sl-overflow-x-auto sl-overflow-y-auto"><div class="sl-code-highlight prism-code language-json"><div class="sl-flex"><div class="sl-flex-1 sl-break-all"><span class="token punctuation">{</span><span class="token plain"></span></div></div><div class="sl-flex"><div class="sl-flex-1 sl-break-all"><span class="token plain"></span><span class="token property">"operationType"</span><span class="token operator">:</span><span class="token plain"></span><span class="token string">"slot_purchase"</span><span class="token punctuation">,</span><span class="token plain"></span></div></div><div class="sl-flex"><div class="sl-flex-1 sl-break-all"><span class="token plain"></span><span class="token property">"previousState"</span><span class="token operator">:</span><span class="token plain"></span><span class="token punctuation">{</span><span class="token plain"></span></div></div><div class="sl-flex"><div class="sl-flex-1 sl-break-all"><span class="token plain"></span><span class="token property">"slotTotal"</span><span class="token operator">:</span><span class="token plain"></span><span class="token string">"[current_number_of_slots]"</span><span class="token plain"></span></div></div><div class="sl-flex"><div class="sl-flex-1 sl-break-all"><span class="token plain"></span><span class="token punctuation">}</span><span class="token punctuation">,</span><span class="token plain"></span></div></div><div class="sl-flex"><div class="sl-flex-1 sl-break-all"><span class="token plain"></span><span class="token property">"targetState"</span><span class="token operator">:</span><span class="token plain"></span><span class="token punctuation">{</span><span class="token plain"></span></div></div><div class="sl-flex"><div class="sl-flex-1 sl-break-all"><span class="token plain"></span><span class="token property">"slotTotal"</span><span class="token operator">:</span><span class="token plain"></span><span class="token string">"[current_number_of_slots + number_of_additional_slots]"</span><span class="token plain"></span></div></div><div class="sl-flex"><div class="sl-flex-1 sl-break-all"><span class="token plain"></span><span class="token punctuation">}</span><span class="token punctuation">,</span><span class="token plain"></span></div></div><div class="sl-flex"><div class="sl-flex-1 sl-break-all"><span class="token plain"></span><span class="token property">"relatedIds"</span><span class="token operator">:</span><span class="token plain"></span><span class="token punctuation">{</span><span class="token plain"></span></div></div><div class="sl-flex"><div class="sl-flex-1 sl-break-all"><span class="token plain"></span><span class="token property">"slotTransactionId"</span><span class="token operator">:</span><span class="token plain"></span><span class="token string">"[ID_slot_transaction]"</span><span class="token plain"></span></div></div><div class="sl-flex"><div class="sl-flex-1 sl-break-all"><span class="token plain"></span><span class="token punctuation">}</span><span class="token punctuation">,</span><span class="token plain"></span></div></div><div class="sl-flex"><div class="sl-flex-1 sl-break-all"><span class="token plain"></span><span class="token property">"effectiveDate"</span><span class="token operator">:</span><span class="token plain"></span><span class="token string">"[current_date]"</span><span class="token plain"></span></div></div><div class="sl-flex"><div class="sl-flex-1 sl-break-all"><span class="token plain"></span><span class="token punctuation">}</span></div></div></div></div><div data-testid="copy-button" class="sl-absolute sl-right-0 sl-pr-2 sl-invisible group-hover:sl-visible sl-invisible"><button type="button" class="sl-button sl-form-group-border sl-h-sm sl-text-base sl-font-medium sl-px-1.5 hover:sl-bg-canvas-50 active:sl-bg-canvas-100 sl-text-muted hover:sl-text-body focus:sl-text-body sl-rounded sl-border-transparent sl-border disabled:sl-opacity-70"><div class="sl-mx-0"><i role="img" aria-hidden="true" class="sl-icon fal fa-copy fa-fw fa-sm"></i></div></button></div></pre>

6. After invoice paid:

   - Gets metadata from paymentMetadata field
   - Finds related slot transaction and updates its status to 'completed'
   - Increases number of slots in subscription:
     - `slotTotal` = current_number_of_slots + number_of_additional_slots
   - Records information in audit log

#### [1.4.1. Adding Additional Slots by Administrator](https://lobster.stoplight.io/docs/api-docs/branches/master/5db4ba2e144b4-1-subscription-management-scenarios#141-adding-additional-slots-by-administrator)

Process (initiated through admin panel):

1. Administrator selects tenant for which to add slots and specifies:
   - Client ID (tenantId)
   - Plan ID (planId)
   - Plan Period ID (planPeriodId)
   - Number of slots (slotTotal)
2. Features:
   - Creation process is identical to process of adding slots by user
   - Administrator can change subscription to any plan, including hidden or deleted
   - All administrator actions are fully recorded in audit log

### [1.5. Creating Invoice on User Request](https://lobster.stoplight.io/docs/api-docs/branches/master/5db4ba2e144b4-1-subscription-management-scenarios#15-creating-invoice-on-user-request)

#### [Process (initiated by API request):](https://lobster.stoplight.io/docs/api-docs/branches/master/5db4ba2e144b4-1-subscription-management-scenarios#process-initiated-by-api-request-4)

1. User requests creation of bill in advance:
   - Process is identical to point 3.3.
2. Features:
   - When paying bill that was created in advance, subscription must be extended "on the front".

#### [1.5.2 Creating Invoice on Administrator Request](https://lobster.stoplight.io/docs/api-docs/branches/master/5db4ba2e144b4-1-subscription-management-scenarios#152-creating-invoice-on-administrator-request)

Process (initiated through admin panel):

1. Administrator selects tenant for which to create bill and specifies:
   - Client ID (tenantId)
2. Features:
   - Creation process is identical to process of creating bill by user
   - All administrator actions are fully recorded in audit log

### [1.6. Invoice Payment](https://lobster.stoplight.io/docs/api-docs/branches/master/5db4ba2e144b4-1-subscription-management-scenarios#16-invoice-payment)

#### [Process (initiated by payment request):](https://lobster.stoplight.io/docs/api-docs/branches/master/5db4ba2e144b4-1-subscription-management-scenarios#process-initiated-by-payment-request)

1. System validates:
   - Invoice exists and has status 'pending' or 'overdue'
   - Invoice hasn't been paid or cancelled
   - Client has permission to pay this invoice
   - Client does not have pending payments
2. System creates preliminary payment record in `subscription_module.payments`:
   - `id` = generated UUID
   - `invoiceId` = ID of invoice being paid
   - `amount` = invoice.totalAmount
   - `currencyId` = invoice.currencyId
   - `status` = 'pending'
   - `method` = selected payment method (e.g., 'CREDIT_CARD', 'BANK_TRANSFER')
   - `paymentProvider` = selected payment gateway
   - `transactionAt` = current date and time
   - `metadata` = standardized JSON with payment details
3. System redirects client to payment gateway with:
   - Payment amount and currency
   - Unique payment identifier
   - Return URLs for success/failure
   - Webhook URL for payment notification
4. After successful payment, payment gateway calls webhook with transaction details:
   - System validates webhook authenticity
   - Finds payment record by external reference
   - Updates payment record in `subscription_module.payments`:
     - `status` = 'completed'
     - `externalPaymentId` = payment gateway transaction ID
     - `paymentMetadata` = JSON with gateway response details
     - `completedAt` = current date and time
5. System updates invoice in `subscription_module.invoices`:
   - `status` = 'paid'
   - `paidAt` = current date and time
   - `updatedAt` = current date and time
6. System processes invoice-specific actions based on `invoiceType`:
   - For 'new' invoices:
     - Sets subscription.isActive = true
     - Updates slot transaction status to 'completed'
   - For 'renewal' invoices:
     - Creates new subscription period
     - Applies any scheduled changes from scheduledChangesMetadata
   - For 'upgrade' invoices:
     - Updates subscription plan and pricing
   - For 'topup' invoices:
     - Updates slot transaction status
     - Increases subscription slot count
7. System creates audit log record in `subscription_module.auditLogs`:
   - `entity` = 'payment'
   - `entityId` = ID created payment
   - `action` = 'completed'
   - `details` = JSON with payment information
   - `actionAt` = current date and time
   - `ipAddress` = payment gateway IP
   - `actionSource` = 'payment_gateway'

#### [1.6.1 Administrator Invoice Payment (offline payment)](https://lobster.stoplight.io/docs/api-docs/branches/master/5db4ba2e144b4-1-subscription-management-scenarios#161-administrator-invoice-payment-offline-payment)

Process (initiated through admin panel):

1. Administrator selects invoice for payment and specifies:
   - Invoice ID (invoiceId)
   - Payment method (e.g., bank transfer, check)
   - External payment reference (optional)
   - Payment date
   - Additional notes
2. System creates payment record in `subscription_module.payments`:
   - `id` = generated UUID
   - `invoiceId` = selected invoice ID
   - `amount` = invoice.totalAmount
   - `currencyId` = invoice.currencyId
   - `status` = 'completed'
   - `method` = specified payment method
   - `paymentProvider` = 'MANUAL'
   - `transactionAt` = specified payment date
   - `completedAt` = current date and time
   - `externalPaymentId` = provided external reference
   - `metadata` = JSON with administrator notes
3. System processes invoice and subscription updates:
   - Same as steps 5-6 in regular payment process
4. System creates detailed audit log records:
   - For payment creation:
     - `entity` = 'payment'
     - `entityId` = ID created payment
     - `action` = 'created'
     - `performedBy` = ID administrator
     - `actionSource` = 'admin_panel'
   - For invoice status update:
     - `entity` = 'invoice'
     - `entityId` = ID invoice
     - `action` = 'paid'
     - `performedBy` = ID administrator
     - `actionSource` = 'admin_panel'
5. System sends notification to client about payment registration.

### [1.6.2 Failed Payment Handling](https://lobster.stoplight.io/docs/api-docs/branches/master/5db4ba2e144b4-1-subscription-management-scenarios#162-failed-payment-handling)

#### [Process (initiated by payment gateway failure or timeout):](https://lobster.stoplight.io/docs/api-docs/branches/master/5db4ba2e144b4-1-subscription-management-scenarios#process-initiated-by-payment-gateway-failure-or-timeout)

1. Payment gateway notifies system about failed payment:
   - Through webhook callback
   - Through failure redirect URL
   - Through payment status check (for timeout cases)
2. System validates payment record in `subscription_module.payments`:
   - Finds payment by external reference or internal payment ID
   - Verifies payment is in 'pending' status
   - Validates webhook authenticity if notification through webhook
3. System updates payment record in `subscription_module.payments`:
   - `status` = 'failed'
   - `completedAt` = current date and time
   - `paymentMetadata` = JSON with failure details:
     <pre tabindex="0" class="sl-code-viewer sl-grid sl-inverted sl-overflow-x-hidden sl-overflow-y-hidden sl-relative sl-bg-canvas sl-outline-none sl-rounded-lg focus:sl-ring sl-ring-primary sl-ring-opacity-50 sl-group" role="group"><div class="sl-code-viewer__scroller sl-overflow-x-auto sl-overflow-y-auto"><div class="sl-code-highlight prism-code language-json"><div class="sl-flex"><div class="sl-flex-1 sl-break-all"><span class="token punctuation">{</span><span class="token plain"></span></div></div><div class="sl-flex"><div class="sl-flex-1 sl-break-all"><span class="token plain"></span><span class="token property">"failureReason"</span><span class="token operator">:</span><span class="token plain"></span><span class="token string">"[error_code_from_gateway]"</span><span class="token punctuation">,</span><span class="token plain"></span></div></div><div class="sl-flex"><div class="sl-flex-1 sl-break-all"><span class="token plain"></span><span class="token property">"failureMessage"</span><span class="token operator">:</span><span class="token plain"></span><span class="token string">"[human_readable_error]"</span><span class="token punctuation">,</span><span class="token plain"></span></div></div><div class="sl-flex"><div class="sl-flex-1 sl-break-all"><span class="token plain"></span><span class="token property">"gatewayResponse"</span><span class="token operator">:</span><span class="token plain"></span><span class="token string">"[full_gateway_response]"</span><span class="token punctuation">,</span><span class="token plain"></span></div></div><div class="sl-flex"><div class="sl-flex-1 sl-break-all"><span class="token plain"></span><span class="token property">"failedAt"</span><span class="token operator">:</span><span class="token plain"></span><span class="token string">"[timestamp]"</span><span class="token plain"></span></div></div><div class="sl-flex"><div class="sl-flex-1 sl-break-all"><span class="token plain"></span><span class="token punctuation">}</span></div></div></div></div><div data-testid="copy-button" class="sl-absolute sl-right-0 sl-pr-2 sl-invisible group-hover:sl-visible sl-invisible"><button type="button" class="sl-button sl-form-group-border sl-h-sm sl-text-base sl-font-medium sl-px-1.5 hover:sl-bg-canvas-50 active:sl-bg-canvas-100 sl-text-muted hover:sl-text-body focus:sl-text-body sl-rounded sl-border-transparent sl-border disabled:sl-opacity-70"><div class="sl-mx-0"><i role="img" aria-hidden="true" class="sl-icon fal fa-copy fa-fw fa-sm"></i></div></button></div></pre>
4. System creates audit log record in `subscription_module.auditLogs`:
   - `entity` = 'payment'
   - `entityId` = ID failed payment
   - `action` = 'failed'
   - `details` = JSON with failure information
   - `actionAt` = current date and time
   - `ipAddress` = payment gateway IP
   - `actionSource` = 'payment_gateway'
5. System handles specific failure scenarios:
   - For temporary failures (e.g., insufficient funds):
     - Keeps invoice in current status ('pending' or 'overdue')
     - Allows retry of payment
6. Timeout handling:
   - System runs periodic check for pending payments older than configured timeout
   - For timed out payments:
     - Verifies payment status with payment gateway
     - Updates payment status based on gateway response
     - If no response from gateway:
       - Marks payment as failed
       - Creates new audit log record with timeout reason
       - Allows new payment attempt

### [1.7. Invoice Cancellation and Related Changes](https://lobster.stoplight.io/docs/api-docs/branches/master/5db4ba2e144b4-1-subscription-management-scenarios#17-invoice-cancellation-and-related-changes)

#### [Process (initiated only by administrator):](https://lobster.stoplight.io/docs/api-docs/branches/master/5db4ba2e144b4-1-subscription-management-scenarios#process-initiated-only-by-administrator)

1. Administrator selects invoice for cancellation in admin panel.
2. System validates:
   - Invoice exists and has status 'pending' or 'overdue'
   - Administrator has rights to cancel invoices
3. System cancels invoice:
   - Sets invoice status = 'annulled'
   - Records administrator ID and cancellation date
   - Adds cancellation reason specified by administrator
4. System automatically cancels all planned changes related to annulled invoice:
   - If this is upgrade invoice - cancels plan upgrade
   - If this is slot purchase invoice - cancels slot transaction (status = 'canceled')
   - If this is renewal invoice with planned changes - clears scheduledChangesMetadata field in subscription
5. System creates detailed audit log record:
   - `entity` = 'invoice'
   - `entityId` = ID annulled invoice
   - `action` = 'annulled'
   - `details` = JSON with information about related canceled changes
   - `performedBy` = ID administrator
   - `actionSource` = 'admin_panel'
6. System notifies client about invoice cancellation and canceled changes.
7. Important: Only administrators can cancel invoices; for clients, this function is unavailable. If client needs to cancel planned changes, they must contact support.

## [2. Subscription Plan Changes by Administrator](https://lobster.stoplight.io/docs/api-docs/branches/master/5db4ba2e144b4-1-subscription-management-scenarios#2-subscription-plan-changes-by-administrator)

### [2.1. Changing Existing Subscription Plan](https://lobster.stoplight.io/docs/api-docs/branches/master/5db4ba2e144b4-1-subscription-management-scenarios#21-changing-existing-subscription-plan)

#### [Process (initiated in admin panel):](https://lobster.stoplight.io/docs/api-docs/branches/master/5db4ba2e144b4-1-subscription-management-scenarios#process-initiated-in-admin-panel)

1. Administrator selects plan for change and specifies new parameter values:
   - Plan name (name)
   - Description (description)
   - Slot price (slotPrice)
   - Slot discount (slotDiscountAmount)
   - Publicity (isPublic)
   - Module composition (planModules)
   - Other parameters
2. System validates:
   - Plan exists
   - New values are valid
3. System updates record in `subscription_module.plans` table:
   - Specified fields are updated
   - `updatedAt` = current date and time
   - `updatedBy` = ID administrator
4. If module composition changes:
   - For deleted modules: deleted corresponding records in `planModules`
   - For added modules: new records are created in `planModules`
5. System creates audit log record:
   - `entity` = 'plan'
   - `entityId` = ID plan
   - `action` = 'updated'
   - `details` = JSON with previous and new values of key parameters
   - `performedBy` = ID administrator
6. Important: Changes do not affect existing active subscriptions, but apply only to new subscriptions and when extending.

### [2.2. Deleting Subscription Plan](https://lobster.stoplight.io/docs/api-docs/branches/master/5db4ba2e144b4-1-subscription-management-scenarios#22-deleting-subscription-plan)

#### [Process (initiated in admin panel):](https://lobster.stoplight.io/docs/api-docs/branches/master/5db4ba2e144b4-1-subscription-management-scenarios#process-initiated-in-admin-panel-1)

1. Administrator selects plan for deletion and specifies successor plan (existing plan).
2. System validates:
   - Both plans exist
   - Successor plan is not deleted
3. System updates deleted plan record:
   - `successorPlanId` = ID successor plan
   - `isPublic` = false
   - `deletedAt` = current date and time
   - `deletedBy` = ID administrator
   - `updatedAt` = current date and time
   - `updatedBy` = ID administrator
4. System creates audit log record:
   - `entity` = 'plan'
   - `entityId` = ID deleted plan
   - `action` = 'deleted'
   - `details` = JSON with successor plan information
   - `performedBy` = ID administrator
5. When extending subscriptions to deleted plan:
   - System automatically adds transition information to scheduledChangesMetadata field
   - In renewal invoice, successor plan cost is specified
   - In invoice metadata, transition information to new plan is specified

#### [2.2.1 Automatic Transition Process to Successor Plan When Extending:](https://lobster.stoplight.io/docs/api-docs/branches/master/5db4ba2e144b4-1-subscription-management-scenarios#221-automatic-transition-process-to-successor-plan-when-extending)

1. When it's time to create renewal invoice for subscription to deleted plan, system:

   - Checks that plan has `deletedAt` (plan deleted)
   - Checks for existence of `successorPlanId` (successor plan specified)
   - Gets successor plan information

2. System automatically creates planned plan change record:

   <pre tabindex="0" class="sl-code-viewer sl-grid sl-inverted sl-overflow-x-hidden sl-overflow-y-hidden sl-relative sl-bg-canvas sl-outline-none sl-rounded-lg focus:sl-ring sl-ring-primary sl-ring-opacity-50 sl-group" role="group"><div class="sl-code-viewer__scroller sl-overflow-x-auto sl-overflow-y-auto"><div class="sl-code-highlight prism-code language-json"><div class="sl-flex"><div class="sl-flex-1 sl-break-all"><span class="token punctuation">{</span><span class="token plain"></span></div></div><div class="sl-flex"><div class="sl-flex-1 sl-break-all"><span class="token plain"></span><span class="token property">"effectiveAt"</span><span class="token operator">:</span><span class="token plain"></span><span class="token string">"[current_subscription_end_date]"</span><span class="token punctuation">,</span><span class="token plain"></span></div></div><div class="sl-flex"><div class="sl-flex-1 sl-break-all"><span class="token plain"></span><span class="token property">"changes"</span><span class="token operator">:</span><span class="token plain"></span><span class="token punctuation">{</span><span class="token plain"></span></div></div><div class="sl-flex"><div class="sl-flex-1 sl-break-all"><span class="token plain"></span><span class="token property">"newPlanId"</span><span class="token operator">:</span><span class="token plain"></span><span class="token string">"[ID_successor_plan]"</span><span class="token punctuation">,</span><span class="token plain"></span></div></div><div class="sl-flex"><div class="sl-flex-1 sl-break-all"><span class="token plain"></span><span class="token property">"reason"</span><span class="token operator">:</span><span class="token plain"></span><span class="token string">"Plan was deleted by administrator and replaced with successor plan"</span><span class="token punctuation">,</span><span class="token plain"></span></div></div><div class="sl-flex"><div class="sl-flex-1 sl-break-all"><span class="token plain"></span><span class="token property">"createdAt"</span><span class="token operator">:</span><span class="token plain"></span><span class="token string">"[current_date_and_time]"</span><span class="token punctuation">,</span><span class="token plain"></span></div></div><div class="sl-flex"><div class="sl-flex-1 sl-break-all"><span class="token plain"></span><span class="token property">"automaticTransition"</span><span class="token operator">:</span><span class="token plain"></span><span class="token boolean">true</span><span class="token plain"></span></div></div><div class="sl-flex"><div class="sl-flex-1 sl-break-all"><span class="token plain"></span><span class="token punctuation">}</span><span class="token plain"></span></div></div><div class="sl-flex"><div class="sl-flex-1 sl-break-all"><span class="token plain"></span><span class="token punctuation">}</span></div></div></div></div><div data-testid="copy-button" class="sl-absolute sl-right-0 sl-pr-2 sl-invisible group-hover:sl-visible sl-invisible"><button type="button" class="sl-button sl-form-group-border sl-h-sm sl-text-base sl-font-medium sl-px-1.5 hover:sl-bg-canvas-50 active:sl-bg-canvas-100 sl-text-muted hover:sl-text-body focus:sl-text-body sl-rounded sl-border-transparent sl-border disabled:sl-opacity-70"><div class="sl-mx-0"><i role="img" aria-hidden="true" class="sl-icon fal fa-copy fa-fw fa-sm"></i></div></button></div></pre>

3. When calculating extension cost system uses successor plan cost, not deleted plan:
   **new_plan = get_plan(plan.successorPlanId)**

   **slot_price = new_plan.slotDiscountPrice !== null**

   **? new_plan.slotDiscountPrice**

   **: new_plan.slotPrice**

   **extension_cost = slot_price \* current_subscription.slotTotal**

4. System creates renewal invoice with detailed plan change information:

   - In notes, specifies: "Plan [old_plan_name] was replaced with plan [new_plan_name] due to changes in plan lineup."
   - In invoice metadata, transition information from deleted plan to successor plan is saved

5. After invoice payment:

   - New subscription is created already on successor plan
   - Client receives all modules and functions according to successor plan
   - Automated transition in audit log is recorded

6. Client receives detailed notification about transition to new plan with explanation of changes in functionality and cost.
7. Important features:

   - If successor plan is more expensive than deleted plan, client will be notified about cost change in advance
   - If successor plan is cheaper, client receives new price automatically
   - Administrator can track all automated transitions through special report in admin panel
   - If necessary, administrator can manually change successor plan for specific clients

### [2.3. Creating Subscription Plan](https://lobster.stoplight.io/docs/api-docs/branches/master/5db4ba2e144b4-1-subscription-management-scenarios#23-creating-subscription-plan)

Process is essentially the same as for updating

## [3. Background Processes, Launched by Task Scheduler](https://lobster.stoplight.io/docs/api-docs/branches/master/5db4ba2e144b4-1-subscription-management-scenarios#3-background-processes-launched-by-task-scheduler)

### [3.1. Creating Invoice for Subscription Extension](https://lobster.stoplight.io/docs/api-docs/branches/master/5db4ba2e144b4-1-subscription-management-scenarios#31-creating-invoice-for-subscription-extension)

#### [Process (initiated by daily task):](https://lobster.stoplight.io/docs/api-docs/branches/master/5db4ba2e144b4-1-subscription-management-scenarios#process-initiated-by-daily-task)

1. System finds subscriptions where:
   - `isActive` = true
   - `subscriptionStatus` = 'active'
   - (endAt - current_date) <= plan.invoiceGenerationDaysBefore days
   - Client has no unpaid invoices with status 'pending' or 'overdue'
2. For each subscription system checks existence of planned changes in scheduledChangesMetadata field.
3. System calculates extension cost:

   - If there is planned plan change:
     **new_plan = get_plan(scheduledChangesMetadata.changes.newPlanId)**

     **new_planPeriod = get_plan_period(scheduledChangesMetadata.changes.newPlanPeriodId OR current_subscription.planPeriodId)**

     **number_of_slots = scheduledChangesMetadata.changes.newSlotTotal OR current_subscription.slotTotal**

     **// Determine effective slot price**

     **if (new_planPeriod.periodSlotPrice IS NOT NULL) {**

     **if (new_planPeriod.periodSlotDiscountPrice IS NOT NULL) {**

     **slot_price = new_planPeriod.periodSlotDiscountPrice**

     **} else if (new_planPeriod.discountPercentage IS NOT NULL) {**

     **slot_price = new_planPeriod.periodSlotPrice \* (1 - new_planPeriod.discountPercentage / 100)**

     **} else {**

     **slot_price = new_planPeriod.periodSlotPrice**

     **}**

     **} else {**

     **slot_price = new_plan.slotDiscountPrice !== null**

     **? new_plan.slotDiscountPrice**

     **: new_plan.slotPrice**

     **if (new_planPeriod.discountPercentage IS NOT NULL) {**

     **slot_price = slot_price \* (1 - new_planPeriod.discountPercentage / 100)**

     **}**

     **}**

     **extension*cost = slot_price * number*of_slots * new_planPeriod.periodMultiplier**

   - If no planned plan change:
     **plan = get_plan(current_subscription.planId)**

     **planPeriod = get_plan_period(current_subscription.planPeriodId)**

     **// Determine effective slot price**

     **if (planPeriod.periodSlotPrice IS NOT NULL) {**

     **if (planPeriod.periodSlotDiscountPrice IS NOT NULL) {**

     **slot_price = planPeriod.periodSlotDiscountPrice**

     **} else if (planPeriod.discountPercentage IS NOT NULL) {**

     **slot_price = planPeriod.periodSlotPrice \* (1 - planPeriod.discountPercentage / 100)**

     **} else {**

     **slot_price = planPeriod.periodSlotPrice**

     **}**

     **} else {**

     **slot_price = plan.slotDiscountPrice !== null**

     **? plan.slotDiscountPrice**

     **: plan.slotPrice**

     **if (planPeriod.discountPercentage IS NOT NULL) {**

     **slot_price = slot_price \* (1 - planPeriod.discountPercentage / 100)**

     **}**

     **}**

     **extension*cost = slot_price * current*subscription.slotTotal * planPeriod.periodMultiplier**

4. System creates invoice for extension:
   - `tenantId` = client ID
   - `subscriptionId` = ID subscription
   - `invoiceNumber` = generated unique number (format: RNW-YYYYMMDD-XXXX)
   - `invoiceType` = 'renewal'
   - `status` = 'pending'
   - `invoiceAt` = current date and time
   - `dueAt` = subscription.endAt
   - `totalAmount` = extension_cost
   - `paymentMetadata` = standardized JSON:
     <pre tabindex="0" class="sl-code-viewer sl-grid sl-inverted sl-overflow-x-hidden sl-overflow-y-hidden sl-relative sl-bg-canvas sl-outline-none sl-rounded-lg focus:sl-ring sl-ring-primary sl-ring-opacity-50 sl-group" role="group"><div class="sl-code-viewer__scroller sl-overflow-x-auto sl-overflow-y-auto"><div class="sl-code-highlight prism-code language-json"><div class="sl-flex"><div class="sl-flex-1 sl-break-all"><span class="token punctuation">{</span><span class="token plain"></span></div></div><div class="sl-flex"><div class="sl-flex-1 sl-break-all"><span class="token plain"></span><span class="token property">"operationType"</span><span class="token operator">:</span><span class="token plain"></span><span class="token string">"renewal"</span><span class="token punctuation">,</span><span class="token plain"></span></div></div><div class="sl-flex"><div class="sl-flex-1 sl-break-all"><span class="token plain"></span><span class="token property">"previousState"</span><span class="token operator">:</span><span class="token plain"></span><span class="token punctuation">{</span><span class="token plain"></span></div></div><div class="sl-flex"><div class="sl-flex-1 sl-break-all"><span class="token plain"></span><span class="token property">"planId"</span><span class="token operator">:</span><span class="token plain"></span><span class="token string">"[ID_current_plan]"</span><span class="token punctuation">,</span><span class="token plain"></span></div></div><div class="sl-flex"><div class="sl-flex-1 sl-break-all"><span class="token plain"></span><span class="token property">"slotTotal"</span><span class="token operator">:</span><span class="token plain"></span><span class="token string">"[current_number_of_slots}"</span><span class="token punctuation">,</span><span class="token plain"></span></div></div><div class="sl-flex"><div class="sl-flex-1 sl-break-all"><span class="token plain"></span><span class="token property">"endAt"</span><span class="token operator">:</span><span class="token plain"></span><span class="token string">"[current_subscription_end_date]"</span><span class="token plain"></span></div></div><div class="sl-flex"><div class="sl-flex-1 sl-break-all"><span class="token plain"></span><span class="token punctuation">}</span><span class="token punctuation">,</span><span class="token plain"></span></div></div><div class="sl-flex"><div class="sl-flex-1 sl-break-all"><span class="token plain"></span><span class="token property">"targetState"</span><span class="token operator">:</span><span class="token plain"></span><span class="token punctuation">{</span><span class="token plain"></span></div></div><div class="sl-flex"><div class="sl-flex-1 sl-break-all"><span class="token plain"></span><span class="token property">"planId"</span><span class="token operator">:</span><span class="token plain"></span><span class="token string">"[ID_extension_plan]"</span><span class="token punctuation">,</span><span class="token plain"></span></div></div><div class="sl-flex"><div class="sl-flex-1 sl-break-all"><span class="token plain"></span><span class="token property">"slotTotal"</span><span class="token operator">:</span><span class="token plain"></span><span class="token string">"[number_of_slots_for_extension]"</span><span class="token punctuation">,</span><span class="token plain"></span></div></div><div class="sl-flex"><div class="sl-flex-1 sl-break-all"><span class="token plain"></span><span class="token property">"startAt"</span><span class="token operator">:</span><span class="token plain"></span><span class="token string">"[new_subscription_start_date]"</span><span class="token punctuation">,</span><span class="token plain"></span></div></div><div class="sl-flex"><div class="sl-flex-1 sl-break-all"><span class="token plain"></span><span class="token property">"endAt"</span><span class="token operator">:</span><span class="token plain"></span><span class="token string">"[new_subscription_end_date]"</span><span class="token plain"></span></div></div><div class="sl-flex"><div class="sl-flex-1 sl-break-all"><span class="token plain"></span><span class="token punctuation">}</span><span class="token punctuation">,</span><span class="token plain"></span></div></div><div class="sl-flex"><div class="sl-flex-1 sl-break-all"><span class="token plain"></span><span class="token property">"scheduledChanges"</span><span class="token operator">:</span><span class="token plain"></span><span class="token string">"[scheduledChangesMetadata_object_or_null]"</span><span class="token plain"></span></div></div><div class="sl-flex"><div class="sl-flex-1 sl-break-all"><span class="token plain"></span><span class="token punctuation">}</span></div></div></div></div><div data-testid="copy-button" class="sl-absolute sl-right-0 sl-pr-2 sl-invisible group-hover:sl-visible sl-invisible"><button type="button" class="sl-button sl-form-group-border sl-h-sm sl-text-base sl-font-medium sl-px-1.5 hover:sl-bg-canvas-50 active:sl-bg-canvas-100 sl-text-muted hover:sl-text-body focus:sl-text-body sl-rounded sl-border-transparent sl-border disabled:sl-opacity-70"><div class="sl-mx-0"><i role="img" aria-hidden="true" class="sl-icon fal fa-copy fa-fw fa-sm"></i></div></button></div></pre>
5. System sends notification to client about need to pay.

### [3.3. Processing Overdue Invoices](https://lobster.stoplight.io/docs/api-docs/branches/master/5db4ba2e144b4-1-subscription-management-scenarios#33-processing-overdue-invoices)

#### [Process (initiated by daily task):](https://lobster.stoplight.io/docs/api-docs/branches/master/5db4ba2e144b4-1-subscription-management-scenarios#process-initiated-by-daily-task-1)

1. System finds invoices where:
   - `status` = 'pending'
   - `dueAt` < current date
2. For such invoices system:
   - Updates status to 'overdue'
   - Gets related subscription
3. For subscriptions with overdue invoices:
   - If this is renewal invoice and current date > subscription.endAt:
     - Updates subscription status `subscriptionStatus` = 'expired'
     - Sets `isActive` = false
4. If plan has lateFeeAmount > 0 and more than gracePeriodDays days have passed after dueAt:
   - Increases `totalAmount` of invoice by lateFeeAmount
   - Adds to field `notes` information about late fee accrual
   - Records late fee accrual information in audit log
5. Important moment: System DOES NOT create new invoices for client with overdue unpaid invoices.

### [3.4. Processing Trial Period End](https://lobster.stoplight.io/docs/api-docs/branches/master/5db4ba2e144b4-1-subscription-management-scenarios#34-processing-trial-period-end)

#### [Process (initiated by daily task):](https://lobster.stoplight.io/docs/api-docs/branches/master/5db4ba2e144b4-1-subscription-management-scenarios#process-initiated-by-daily-task-2)

1. System finds subscriptions where:
   - `subscriptionStatus` = 'trial'
   - `trialEndAt` <= current date
2. For each such subscription:
   - Updates subscription status: `subscriptionStatus` = 'expired'
   - Sets `isActive` = false (subscription deactivates)
3. System creates invoice for full period payment:
   - `tenantId` = client ID
   - `subscriptionId` = ID subscription
   - `invoiceNumber` = generated unique number (format: TRL-YYYYMMDD-XXXX)
   - `invoiceType` = 'post_trial'
   - `status` = 'pending'
   - `invoiceAt` = current date and time
   - `dueAt` = endAt // Payment due date set to end of subscription period
   - `totalAmount` = full subscription cost
   - `paymentMetadata` = standardized JSON:
     <pre tabindex="0" class="sl-code-viewer sl-grid sl-inverted sl-overflow-x-hidden sl-overflow-y-hidden sl-relative sl-bg-canvas sl-outline-none sl-rounded-lg focus:sl-ring sl-ring-primary sl-ring-opacity-50 sl-group" role="group"><div class="sl-code-viewer__scroller sl-overflow-x-auto sl-overflow-y-auto"><div class="sl-code-highlight prism-code language-json"><div class="sl-flex"><div class="sl-flex-1 sl-break-all"><span class="token punctuation">{</span><span class="token plain"></span></div></div><div class="sl-flex"><div class="sl-flex-1 sl-break-all"><span class="token plain"></span><span class="token property">"operationType"</span><span class="token operator">:</span><span class="token plain"></span><span class="token string">"trial_conversion"</span><span class="token punctuation">,</span><span class="token plain"></span></div></div><div class="sl-flex"><div class="sl-flex-1 sl-break-all"><span class="token plain"></span><span class="token property">"previousState"</span><span class="token operator">:</span><span class="token plain"></span><span class="token punctuation">{</span><span class="token plain"></span></div></div><div class="sl-flex"><div class="sl-flex-1 sl-break-all"><span class="token plain"></span><span class="token property">"subscriptionStatus"</span><span class="token operator">:</span><span class="token plain"></span><span class="token string">"trial"</span><span class="token punctuation">,</span><span class="token plain"></span></div></div><div class="sl-flex"><div class="sl-flex-1 sl-break-all"><span class="token plain"></span><span class="token property">"isTrial"</span><span class="token operator">:</span><span class="token plain"></span><span class="token boolean">true</span><span class="token punctuation">,</span><span class="token plain"></span></div></div><div class="sl-flex"><div class="sl-flex-1 sl-break-all"><span class="token plain"></span><span class="token property">"isActive"</span><span class="token operator">:</span><span class="token plain"></span><span class="token boolean">false</span><span class="token plain"></span></div></div><div class="sl-flex"><div class="sl-flex-1 sl-break-all"><span class="token plain"></span><span class="token punctuation">}</span><span class="token punctuation">,</span><span class="token plain"></span></div></div><div class="sl-flex"><div class="sl-flex-1 sl-break-all"><span class="token plain"></span><span class="token property">"targetState"</span><span class="token operator">:</span><span class="token plain"></span><span class="token punctuation">{</span><span class="token plain"></span></div></div><div class="sl-flex"><div class="sl-flex-1 sl-break-all"><span class="token plain"></span><span class="token property">"subscriptionStatus"</span><span class="token operator">:</span><span class="token plain"></span><span class="token string">"active"</span><span class="token punctuation">,</span><span class="token plain"></span></div></div><div class="sl-flex"><div class="sl-flex-1 sl-break-all"><span class="token plain"></span><span class="token property">"isTrial"</span><span class="token operator">:</span><span class="token plain"></span><span class="token boolean">false</span><span class="token punctuation">,</span><span class="token plain"></span></div></div><div class="sl-flex"><div class="sl-flex-1 sl-break-all"><span class="token plain"></span><span class="token property">"isActive"</span><span class="token operator">:</span><span class="token plain"></span><span class="token boolean">true</span><span class="token plain"></span></div></div><div class="sl-flex"><div class="sl-flex-1 sl-break-all"><span class="token plain"></span><span class="token punctuation">}</span><span class="token punctuation">,</span><span class="token plain"></span></div></div><div class="sl-flex"><div class="sl-flex-1 sl-break-all"><span class="token plain"></span><span class="token property">"effectiveDate"</span><span class="token operator">:</span><span class="token plain"></span><span class="token string">"[current_date]"</span><span class="token plain"></span></div></div><div class="sl-flex"><div class="sl-flex-1 sl-break-all"><span class="token plain"></span><span class="token punctuation">}</span></div></div></div></div><div data-testid="copy-button" class="sl-absolute sl-right-0 sl-pr-2 sl-invisible group-hover:sl-visible sl-invisible"><button type="button" class="sl-button sl-form-group-border sl-h-sm sl-text-base sl-font-medium sl-px-1.5 hover:sl-bg-canvas-50 active:sl-bg-canvas-100 sl-text-muted hover:sl-text-body focus:sl-text-body sl-rounded sl-border-transparent sl-border disabled:sl-opacity-70"><div class="sl-mx-0"><i role="img" aria-hidden="true" class="sl-icon fal fa-copy fa-fw fa-sm"></i></div></button></div></pre>
4. System processes slot transactions:
   - Finds existing record of trial transaction type in `subscription_module.subscriptionSlotTransactions` table
   - Creates new transaction record of purchase type for the same slots:
     - `subscriptionId` = ID subscription
     - `transactionType` = 'purchase'
     - `slotCount` = same number of slots as in trial transaction
     - `pricePerSlot` = slot price from subscription plan
     - `effectiveAt` = current date and time
     - `transactionAt` = current date and time
     - `status` = 'pending' // Will be changed to 'completed' after invoice payment
     - `reason` = 'Converting trial slots to paid slots'
5. After invoice payment system updates subscription:
   - `subscriptionStatus` = 'active'
   - `isTrial` = false
   - `isActive` = true
   - `subscriptionPrice` = full subscription cost
   - Updates slot transaction status with purchase type to 'completed'
6. Important: In trial period, immediately issued number of slots equal to maxTrialSlots, but cannot change plan until trial ends and is paid.

## [4. Complex Scenarios and Errors](https://lobster.stoplight.io/docs/api-docs/branches/master/5db4ba2e144b4-1-subscription-management-scenarios#4-complex-scenarios-and-errors)

#### [General rules for complex cases:](https://lobster.stoplight.io/docs/api-docs/branches/master/5db4ba2e144b4-1-subscription-management-scenarios#general-rules-for-complex-cases)

1. When complex scenarios arise that cannot be automatically processed by system:
   - System rejects operation
   - Returns client informative message with suggestion to contact support
   - Records error information in audit log
2. Examples of complex scenarios requiring support intervention:
   - Subscription change in state other than 'active'
   - Attempt to modify with existing unpaid invoices
   - Conflicting requests for subscription modification
   - Errors in cost or date calculations
   - Special requests for re-calculation or partial refund
3. Support has special tools in admin panel for:
   - Manual subscription and invoice status changes
   - Creating special invoices with arbitrary amounts
   - Canceling and modifying existing invoices
   - Manual creation and modification of slot transactions
4. All support actions are recorded in audit log with administrator ID and change reason.
5. For cases when client needs exception from standard process, special request form in client support must be implemented. тут описана основная

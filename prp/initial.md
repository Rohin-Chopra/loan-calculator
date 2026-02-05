# 📄 Product Requirements Document (PRD)

## Product Name

**Kill My Loan** (working name)

## Version

v1.0 (MVP)

## Owner

Rohin Chopra

## Target Platform

**Mobile-first web app** (React / Next.js)
(Mobile responsive; native app can come later)

---

## 🎯 Problem Statement

Most loan calculators only show minimum repayments and hide the true cost of interest. Users don’t understand how small changes in repayment behaviour dramatically reduce interest and loan duration—especially in **fortnightly Australian pay cycles**.

---

## 🧠 Product Goal

Help users:

* Understand the *true cost* of their loan
* See how extra repayments & lump sums reduce interest
* Build a clear, motivating payoff plan

---

## 👤 Target Users

* Australians with **car loans / personal loans**
* Salary earners paid **weekly or fortnightly**
* People planning major goals (house, wedding, investments)

---

## ✅ Success Metrics

* User can calculate loan payoff accurately
* User can simulate extra repayments and lump sums
* User clearly sees **interest saved & time reduced**
* App works without login or backend (MVP)

---

## 🧩 MVP FEATURES

### 1️⃣ Loan Input Module

**Inputs**

* Loan amount ($)
* Interest rate (% p.a.)
* Loan term (years)
* Repayment frequency:

  * Weekly
  * Fortnightly
  * Monthly

**Acceptance Criteria**

* Validation for all numeric fields
* Frequency adjusts repayment calculations correctly

---

### 2️⃣ Repayment Calculator

**Outputs**

* Minimum repayment per period
* Total amount paid
* Total interest paid
* Loan end date

**Logic**

* Interest compounded based on repayment frequency
* Use standard amortisation formula

---

### 3️⃣ Extra Repayment Simulator (Core Feature)

**Inputs**

* Extra repayment per period (slider or input)

  * Default steps: $25, $50, $100

**Outputs (Live Update)**

* New loan payoff date
* Years/months saved
* Interest saved ($)

**Acceptance Criteria**

* Updates instantly when slider moves
* Cannot go below minimum repayment

---

### 4️⃣ Lump Sum Payments

**Inputs**

* One or more lump sums:

  * Amount
  * Timing (months from start OR specific date)

**Outputs**

* Updated payoff timeline
* Interest saved per lump sum
* New loan end date

---

### 5️⃣ Visualisation

**Charts**

* Loan balance over time (line chart)
* Before vs After comparison (baseline vs accelerated)

**UI**

* Clear labels
* Tooltips for interest vs principal

---

### 6️⃣ Summary Panel (Motivation Layer)

Show:

* “You save **$X** in interest”
* “You finish **Y years earlier**”
* “This is equivalent to a **9.5% risk-free return**”

---

## 📐 Calculation Logic (Must Be Accurate)

### Repayment Formula

Let:

* `P` = loan principal
* `r` = annual interest rate (decimal)
* `n` = payments per year
* `t` = total years

```
periodic_rate = r / n
total_payments = n * t

repayment = P * (periodic_rate) / (1 - (1 + periodic_rate)^(-total_payments))
```

### Extra Repayments

* Apply extra amount directly to principal
* Recalculate remaining term dynamically

### Lump Sums

* Reduce principal immediately at specified period
* Recalculate amortisation from that point

---

## 🧱 Non-Functional Requirements

* No backend required for MVP
* All calculations client-side
* Mobile-first responsive design
* Fast recalculations (<100ms)

---

## 🖥️ Screen Flow

1. **Loan Input Screen**
2. **Results Screen**

   * Minimum repayment
   * Interest cost
3. **Optimisation Screen**

   * Extra repayments slider
   * Lump sum inputs
4. **Visualisation + Summary**

   * Charts
   * Savings breakdown

---

## 🧠 UX Principles

* Plain English
* No finance jargon
* “Show pain” but don’t shame
* Positive reinforcement

---

## 🚫 Out of Scope (v1)

* User accounts
* Bank integrations
* Credit scores
* Refinancing APIs
* Push notifications

---

## 🔮 Future Enhancements (v2+)

* Multiple loans dashboard
* HECS/HELP support
* Refinance recommendations
* Save/share payoff plans
* Native iOS/Android app

---

## 🧪 Test Scenarios

* $52k @ 9.5%, 7 years, fortnightly
* Extra $100/fortnight reduces term correctly
* Lump sum applied mid-term recalculates correctly
* Edge cases: very short loan, high interest

---

## 📦 Deliverables for Implementation

Cursor should generate:

* Loan calculation utility module
* React components for:

  * Input form
  * Slider
  * Charts
* Clean, readable UI
* Inline comments explaining math

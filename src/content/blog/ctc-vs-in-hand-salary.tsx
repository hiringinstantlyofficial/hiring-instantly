import type { Article } from "@/types/blog";

export const article: Article = {
  slug: "ctc-vs-in-hand-salary",
  title: "CTC vs In-Hand: How to Read an Indian Salary Offer",
  description:
    "A 12 LPA offer does not put 1 lakh a month in your account. A component-by-component walkthrough of an Indian CTC, with the arithmetic.",
  excerpt:
    "Basic, HRA, employer PF, gratuity, variable pay, insurance premiums — what each component actually does to your monthly cash, and the five questions to ask before you accept.",
  category: "salary",
  publishedAt: "2026-07-30",
  readingMinutes: 12,
  tags: ["Salary", "CTC", "Provident Fund", "Offer Letters"],
  related: [
    "negotiate-salary-in-india",
    "notice-period-and-relieving-letter",
    "first-job-without-experience",
  ],
  body: (
    <>
      <p>
        The most common disappointment in Indian hiring arrives on the last
        working day of a candidate&apos;s first month. They accepted an offer of
        ₹12 lakh per annum, divided it by twelve, expected ₹1,00,000, and
        received something closer to ₹78,000.
      </p>
      <p>
        Nothing dishonest necessarily happened. CTC — cost to company — is a
        measure of what the employer spends on you, and a good deal of that
        spending never becomes cash in your account. Reading an offer properly
        means knowing which parts do and which parts do not.
      </p>
      <p>
        Everything below is directional and meant to help you ask better
        questions. Rates and rules change, so check the current position for your
        situation with a qualified professional before making a financial
        decision.
      </p>

      <h2>What CTC is actually made of</h2>
      <p>
        A typical Indian offer letter has an annexure breaking the number into
        components. They fall into three groups, and the distinction is the whole
        point.
      </p>

      <h3>Group one: money that reaches you monthly</h3>
      <ul>
        <li>
          <strong>Basic salary.</strong> Usually 40–50% of CTC. This is the
          reference number for a lot of other things — PF, gratuity, and often
          your notice-period buyout amount — so a low basic is not neutral, it
          quietly shrinks your retirement contributions and your gratuity.
        </li>
        <li>
          <strong>House Rent Allowance (HRA).</strong> Commonly 40–50% of basic.
          Fully paid to you, and partly exempt from tax if you pay rent and are
          on the old tax regime. If you live in your own home or with family, it
          is simply taxable salary with a different name.
        </li>
        <li>
          <strong>Special allowance / other allowance.</strong> The balancing
          figure that makes the arithmetic add up to the promised CTC. Fully
          taxable, no conditions.
        </li>
        <li>
          <strong>Reimbursements</strong> — telephone, fuel, books, meal cards.
          Paid on production of bills, so treat any you will not claim as money
          you are not getting.
        </li>
      </ul>

      <h3>Group two: money set aside for you, but not now</h3>
      <ul>
        <li>
          <strong>Employer&apos;s PF contribution.</strong> 12% of basic, counted
          in your CTC. It is genuinely your money and it compounds at a decent
          statutory rate — but it goes to your EPF account, not your bank. Your
          own matching 12% is additionally deducted from your salary, so PF hits
          your monthly cash twice: once as a CTC component you never see, and
          once as a deduction.
        </li>
        <li>
          <strong>Gratuity.</strong> Often shown as roughly 4.81% of basic.
          Payable under the Payment of Gratuity Act only once you complete five
          years of continuous service — with a widely applied rule treating four
          years plus 240 days in the fifth year as qualifying. If you expect to
          move in three years, this component of your CTC is worth nothing to
          you. Employers count it anyway.
        </li>
        <li>
          <strong>NPS contributions</strong>, where offered. Same logic.
        </li>
      </ul>

      <h3>Group three: money that may never exist</h3>
      <ul>
        <li>
          <strong>Variable pay / performance bonus.</strong> Frequently 10–20% of
          CTC, and the single largest source of offer-letter disappointment. It is
          conditional, often on company performance rather than yours, and
          frequently paid at 60–80% of target in a bad year.
        </li>
        <li>
          <strong>Joining bonus.</strong> One-time, and almost always subject to
          a clawback if you leave within twelve or eighteen months. Do not treat
          it as salary.
        </li>
        <li>
          <strong>Retention bonus.</strong> Paid on a date, conditional on you
          being there.
        </li>
        <li>
          <strong>ESOPs or RSUs.</strong> Sometimes shown inside CTC at a
          notional valuation, which is optimistic accounting. In an unlisted
          Indian company these are worth nothing until there is a liquidity
          event, and you should value them accordingly when comparing offers.
        </li>
        <li>
          <strong>Insurance premiums and &ldquo;benefits.&rdquo;</strong> The
          group medical premium the company pays is a real benefit and a real
          cost to them. It is not income.
        </li>
      </ul>

      <h2>The arithmetic, worked through</h2>
      <p>
        Take a ₹12,00,000 CTC offer with a fairly standard structure. Numbers are
        rounded, and the tax figure is indicative only.
      </p>
      <div className="overflow-x-auto">
        <table>
          <thead>
            <tr>
              <th>Component</th>
              <th>Annual</th>
              <th>Reaches your bank monthly?</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Basic salary</td>
              <td>₹5,40,000</td>
              <td>Yes</td>
            </tr>
            <tr>
              <td>HRA</td>
              <td>₹2,70,000</td>
              <td>Yes</td>
            </tr>
            <tr>
              <td>Special allowance</td>
              <td>₹1,62,000</td>
              <td>Yes</td>
            </tr>
            <tr>
              <td>Employer PF (12% of basic)</td>
              <td>₹64,800</td>
              <td>No — goes to EPF</td>
            </tr>
            <tr>
              <td>Gratuity provision (4.81% of basic)</td>
              <td>₹25,974</td>
              <td>No — only after ~5 years</td>
            </tr>
            <tr>
              <td>Group medical premium</td>
              <td>₹17,226</td>
              <td>No — a benefit, not cash</td>
            </tr>
            <tr>
              <td>Variable pay (target)</td>
              <td>₹1,20,000</td>
              <td>No — annual, and conditional</td>
            </tr>
            <tr>
              <td>
                <strong>Total CTC</strong>
              </td>
              <td>
                <strong>₹12,00,000</strong>
              </td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </div>
      <p>
        The cash portion is ₹5,40,000 + ₹2,70,000 + ₹1,62,000 ={" "}
        <strong>₹9,72,000</strong> — that is your gross salary, ₹81,000 a month.
        From that comes:
      </p>
      <ul>
        <li>
          <strong>Your own PF contribution:</strong> 12% of basic, ₹5,400 a
          month.
        </li>
        <li>
          <strong>Professional tax:</strong> a state levy, typically ₹200 a
          month where it applies.
        </li>
        <li>
          <strong>TDS on income tax:</strong> depends on your regime and
          deductions. Say ₹4,000–6,000 a month at this level.
        </li>
      </ul>
      <p>
        Which lands you around <strong>₹70,000 a month in hand</strong> against a
        headline of ₹12 LPA — plus roughly ₹1,20,000 of variable pay once a year
        if targets are met, and ₹1,29,600 a year accumulating in your EPF account
        between the two contributions.
      </p>
      <p>
        That is a perfectly reasonable offer. It is simply not ₹1 lakh a month,
        and no arithmetic will make it so.
      </p>

      <h2>Two offers, same CTC, different value</h2>
      <p>
        This is why comparing headline CTCs is close to meaningless. Consider two
        ₹15 LPA offers:
      </p>
      <div className="overflow-x-auto">
        <table>
          <thead>
            <tr>
              <th></th>
              <th>Offer A</th>
              <th>Offer B</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Fixed cash component</td>
              <td>₹13,20,000</td>
              <td>₹10,20,000</td>
            </tr>
            <tr>
              <td>Variable (target)</td>
              <td>₹75,000</td>
              <td>₹3,00,000</td>
            </tr>
            <tr>
              <td>ESOPs at notional value</td>
              <td>—</td>
              <td>₹1,50,000</td>
            </tr>
            <tr>
              <td>Retirement and benefit provisions</td>
              <td>₹1,05,000</td>
              <td>₹30,000</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p>
        Offer A pays about ₹25,000 more per month in guaranteed cash. Offer B is
        worth more only if the variable pays near target and the equity becomes
        liquid — two independent bets. Neither is wrong, but they are very
        different jobs financially, and the recruiter for B will describe it as
        the higher offer.
      </p>

      <h2>The tax regime choice</h2>
      <p>
        India runs two personal income tax regimes. The newer default has lower
        slab rates but removes most exemptions and deductions; the older one
        keeps them. Broadly, if you claim a lot — HRA on a high city rent, home
        loan interest, 80C investments, insurance premiums — the old regime can
        still win. If you claim little, the new one usually does.
      </p>
      <p>
        Slabs, the standard deduction and the rebate threshold have all been
        revised repeatedly in recent budgets, so do not rely on a comparison you
        read a year ago. Run both on the Income Tax Department&apos;s own
        calculator for your actual numbers before you tell payroll which regime
        you are choosing, and note that your salary structure affects the answer
        — an offer with high HRA is worth more under the old regime than the same
        CTC packed into special allowance.
      </p>

      <h2>Five questions before you accept</h2>
      <p>
        Ask these in writing, by email, before signing. A reasonable employer
        will answer all five without friction, and reluctance on any of them is
        information in itself.
      </p>
      <ol>
        <li>
          <strong>
            Can you share the full CTC break-up with the monthly in-hand figure?
          </strong>{" "}
          Ask for the number after standard deductions. Most companies have this
          ready.
        </li>
        <li>
          <strong>
            What percentage of target variable pay was actually paid out in the
            last two cycles, company-wide?
          </strong>{" "}
          Not the policy — the history. This is the question that most changes
          your expectations.
        </li>
        <li>
          <strong>Is the variable linked to individual, team or company
          performance, and when is it paid?</strong> A company-linked annual
          bonus is nearly outside your control.
        </li>
        <li>
          <strong>Is there a clawback on the joining bonus, and for how
          long?</strong> Get the exact period and the repayment terms.
        </li>
        <li>
          <strong>For equity: how many units, what is the strike price, the
          vesting schedule and cliff, and the current fair market
          valuation?</strong> If any of those cannot be answered, value the
          equity at zero for comparison purposes and treat any upside as a
          bonus.
        </li>
      </ol>

      <h2>Two things that quietly cost you</h2>
      <p>
        <strong>A deliberately low basic.</strong> Some employers keep basic at
        30% of CTC to reduce their PF and gratuity liability. It raises your
        immediate take-home slightly and reduces your retirement corpus, your
        gratuity, and — since notice buyouts are often calculated on basic — can
        cut both ways later. Worth noticing, though it is rarely negotiable.
      </p>
      <p>
        <strong>The notice period clause.</strong> Ninety days is common in
        Indian companies and it is a real cost, because your next employer may
        not wait and buying out three months can be expensive. Read that clause
        before you sign this offer, not when you are leaving.
      </p>
      <p>
        Read the annexure, not the headline. It takes ten minutes and it is the
        difference between negotiating from the actual numbers and being
        surprised by them at the end of your first month.
      </p>
    </>
  ),
};

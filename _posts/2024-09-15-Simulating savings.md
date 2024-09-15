---
layout: post
---
In personal finance, understanding what to expect from long-term investments and planning for the future is crucial. This is particularly true for pensions and other long-term financial goals, where today’s decisions can have a significant impact on the outcome. However, the distant nature of these goals often makes it easy to prioritize short-term concerns over long-term planning.

In this article, we will explore the expected returns of different investment types, their associated risks, and how a long-term investment horizon affects decision-making. We will use Python to simulate various investment scenarios and provide insights into how much one should save to meet their end goal with a certain level of confidence. The Python code provided will support our analysis, though understanding it is not essential to grasp the overall results.

### What can we expect of different investment types?
This is another topic that is of much controversy currently, and our goal is simply to find some reasonable numbers given historical data and largely ignore discussions about the future. We will assume that our average expected returns of the different activa is represented by historical data and simulate deviations around this mean over time.

For our expected returns, I will utilize the findings of the paper [The Rate of Return of Everything (2015 Jordà et al.)](https://www.frbsf.org/wp-content/uploads/wp2017-25.pdf) which, much like the title suggests, analyzes historical data all the way back to 1870 to come up with historical returns on different activa. We will use the global averages and standard deviations from their paper to come up with our expected returns and risk numbers to be used in the next section. We will start with taking our numbers from the full sample of <b>nominal</b> global returns (page 15). 

| Asset Type | Avg Annual Return | Standard Deviation  |
| :--------  | :---------------- | :------------------ |
| Equity     | 10.75             | 22.78               |
| Bonds      | 6.10              | 8.91                |
| Housing    | 11.06             | 10.70               |
| Bills      | 4.6               | 3.33                |
{:.mbtablestyle}

For our purposes, we will simplify and remove housing from the equation. The reason is that housing or real estate is quite a different investment strategy than the others, it requires higher upfront capital which increases the barriers to entry into the market and other considerations such as rent from tenants, less liquidity, high debt gearing and often complex taxation rules. It is thus seldom used as a pension investment strategy, and most government pension and long term schemes does not allow you to invest your public pension into these activa for those reasons. With that being said, it obviously provides the best returns at the lowest risk historically and should be considered as a major activa in any personal finance portfolio. We will also take bills out of the equation and focus on risk-free interests rate returns from bank deposits instead to simplify and since these are most readily available as a part of an investment portfolio. This gives us 3 activa for common investment profiles, namely equity, bonds and risk-free rate (i.e. bank deposits)

As investors we do not really care about nominal returns but rather real returns and the real current value of the money, so we need to take that into account by adjusting for inflation. The paper does include real returns historically, however over the last decades most major economies governments has adopted an inflation target monetary policy which means that they are targeting a certain stable yearly inflation in the long-term. This is typically around 2-2.5% and for our purposes we will assume average inflation will remaing at 2.5%. We also assume 0% real returns in from risk-free in the long run, which means our risk-free return is 2.5%.

With this out of the way, let us dive into doing some simulations using these numbers.

### Simulating investments over time
Since we are simulating invesments from savings over time, then it is natural to do this at a monthly basis. This means that at start of each month we will invest some money into our activa, which we will call our monthly investment level. So we will first convert our annual returns into monthly equivalents taking into account the compounded rate of return, we also have to do the same with our standard deviations.

{% include codeHeader.html %}
```python
from typing import Tuple, List, TypeAlias
import numpy as np

InfoList: TypeAlias = List[Tuple[float, float]]

def convert_to_monthly(growth_rate: float, stdev: float) -> Tuple[float, float]:
    monthly_growth_rate = (growth_rate) ** (1 / 12) - 1
    monthly_stdev = stdev / np.sqrt(12)
    return monthly_growth_rate, monthly_stdev


def print_info(activa: str, growth_rate: float, stdev: float) -> None:
    print(f"{activa}: {100*growth_rate:.2f}%, {100*stdev:.2f}")


activa_info: InfoList = [(1.1075, 0.2278), (1.061, 0.0891), (1.025, 0)]
monthly_info: InfoList = [convert_to_monthly(r, d) for r, d in activa_info]

print_info("Equity", monthly_info[0][0], monthly_info[0][1])
# Equity: 0.85%, 6.58
print_info("Bonds", monthly_info[1][0], monthly_info[1][1])
# Bonds: 0.49%, 2.57
print_info("RiskFree", monthly_info[2][0], monthly_info[2][1])
# RiskFree: 0.21%, 0.00
```

To simulate how our investments will behave over time, we also need to decide how to use our risk, measured as the standard deviation, to generate different returns from a selected distribution. We will use a lognormal distribution to generate these returns. The lognormal distribution resembles that of a normal distribution but has a longer upper tail and the median is lower than the mean, meaning its a skewed distribution. This typically represents the possibility to draw abnormally high values from the stock market. It also have the nice property that -100% is its lower bound when working with growth rates (meaning we draw 1.1 for a 10% return) which would mean drawing close to 0, so it has good properties which mimic the real investment market. It is simply a log transformation of a normal distribution. For unfamiliar readers, the mean of the distribution is our expected value, while the standard deviation is how much the values typically deviate from the mean. A higher value means they are typically further away, and the opposite for a smaller value. Thereby, its a good measurement of risk. For example, we see that equity has a higher standard deviation than bonds, meaning it is riskier since the returns are more varied.

![image](..\..\..\assets\images\lognormalDist.png)

The above shows a plot of a lognormal distribution where the log-transformed mean and standard deviation is 1. Note that it has been capped at x=5 for formatting purposes. We can see the skewed nature of the distribution, which is especially easy to see given that the median and mean is not equivalent which is a trademark of a regular normal distribution. Median is lower than the mean which exemplifies the upside potential of the distribution.
This was generated through the following code with n=1,000,000

{% include codeHeader.html %}
```python
import numpy as np

def generate_lognormal(mean: float, stdev: float, n: int = 1) -> np.ndarray:
    """
    Generates a set of observations based on a draw from a
    log-normal distribution with a specified mean and standard deviation
    """
    phi: float = (stdev**2 + mean**2) ** 0.5
    mu: float = np.log(mean**2 / phi)
    sigma: float = (np.log(phi**2 / mean**2)) ** 0.5
    return np.random.lognormal(mu, sigma, n)
```

We will start out our simulations by assuming that we have an amount of money x at time 0 which we can invest into our 3 activa, for simplicity we will assume no taxation.
Let us start with x=1, which you can interpret as 1 dollar or whatever you want, since it will gives us a good idea of the multiplier we end up with. We will assume we save this amount and leave them for 40 years.
Let us invest them all in stocks and run 1,000 simulations and look at the results.
![image](..\..\..\assets\images\40Years.png)

Here each of the lines represent a simulation using the aforementioned expected returns and risks, each month we call our generate_lognormal function with n=1 and mutliply the value of our portfolio at that time with what we draw. We can see that there is quite a wide spread set of results just using our 1000 simulations. The best we do is just above 35, meaning we have 35 times our original money at the end of our 40 years, while the worst we do is around 18, around half of our best. Our expected value from this case is 27. Obviously, this set of randomness makes it quite hard to plan our present days savings level to reach what we need for our long-term goal, whether that is a big purchase or retirement. For clarity, we can also look at the distribution of end values for our simulation as seen below.

![image](..\..\..\assets\images\40YearDist.png)

For completeness, this would be the code to generate these simulations

{% include codeHeader.html %}
```python
ret_stocks: float = 0.0085
vol_stocks: float = 0.0658
ret_bonds: float = 0.0049
vol_bonds: float = 0.0257
ret_riskfree: float = 0.0021
vol_riskfree: float = 0.0
stocks_share: float = 1.0
bond_share: float = 0.0
riskfree_share: float = 0.0
inflation: float = 0.02
current_savings: float = 1.0
monthly_savings: float = 0.0
investment_years: int = 40
monthly_periods: int = 12 * investment_years
n_simulations: int = 1000

# The covariance matrix determines how assets move together
# So if stocks go up, bonds go down, while others might not move at all
# This matters for our final portfolio variance
covariance_matrix: np.ndarray = np.array(
    [
        [1 * vol_stocks**2, -0.2 * vol_stocks * vol_bonds, 0],
        [-0.2 * vol_stocks * vol_bonds, 1 * vol_bonds**2, 0],
        [0, 0, 0],
    ]
)
ret_port: float = (
    stocks_share * ret_stocks + bond_share * ret_bonds + riskfree_share * ret_riskfree
)
arr_weight: np.ndarray = np.array([stocks_share, bond_share, riskfree_share])
vol_port: float = np.matmul(
    np.matmul(np.transpose(arr_weight), covariance_matrix), arr_weight
)
monthly_inflation: float = (1 + inflation) ** (1 / 12) - 1
np.random.seed(1055)
pension_dev: List[List[float]] = []
for sim in range(n_simulations):
    current_run: List[float] = [current_savings]
    balance: float = current_savings
    for month in range(monthly_periods):
        ret_month: float = generate_lognormal(ret_port, vol_port)[0]
        # The additional savings plus returns from this month
        # assuming savings are made in first day of the month
        add_annuity: float = monthly_savings * (1 + ret_month) / (1 + monthly_inflation)
        current_run.append(
            balance * (1 + ret_month) / (1 + monthly_inflation) + add_annuity
        )
        balance = current_run[-1]
    pension_dev.append(current_run)
```

We can also use this distribution to look at the probability of achieving some end goal, for example lets say we would need to have at a multiplier of at least 23 to live comfortably in 40 years. Then looking at the values from the distribution, we find that we can assume to be over this with around a 94% confidence.
This is of course if we invest everything into stocks, which is the most aggresive strategy we can have in our case, but one which is likely to pay off massively over such a long period of time.

To make things more interesting, let us look at our median, 25th and 75th percentile over time for two basic strategies.

![image](..\..\..\assets\images\BondsVsStocks.png)

The results might be obvious to some, but it really puts in perspective how much the investment strategies matter over time when looking at long-horizons such as pension savings, which the 40 years are meant to approximate. This is even without any monthly savings and purely returns from current investment which one lets sit in the market over this time period. Generally, to suggest that anyone with more than 10 years left of their work life should invest in anything but global stocks as a generic strategy seems far fetched. Naturally, taxes come into play and can change the magnitude of the results somewhat depending on where you are situated and the local regulations, but the conclusion will remain the same in any sensible tax environment. In fact, many countries such as Norway will have more benefits for pure stock investments, mainly to further incentivise people to take advantage of the results shown. One such regulation is that for investments into stocks through a special stock account, there is no tax until the gains has been moved out of the account. That means you can buy and sell within the account and tax will only be triggered when you move out your gains. This essentially means you can wait until year 40 to trigger any taxation, ignoring any potential wealth tax, which again would mean you would simply have to multiply the end result from above with (1-taxRate) to get the final value. Most countries have stopped doing unrealized taxation of returns, and if you are only investing in some global index funds you should be able to have the same situation as above, however moving between index funds or even to certain stocks could trigger taxes within the saving period.

Lets look at another long-term situation where we are also investing a certain amount of money every month, simulating a typical pension scheme. Typically, such contributions are around 4-5% of monthly salary, so we will start with 20,000 at time 0 (some initial savings we have) and add around 2,000 to that each month.
Lets look at our development in those cases. We will once again invest all of it in stocks and to change things up a bit we will assume 32 years left to work. 
With our assumed returns, we should expect this portfolio to be worth about 3,630,000 after 32 years. To put this into perspective, if we assume a payout period of 16 years, then we should assume around 19,000 each month in real terms at time 0 given no more returns. Overall, we can see that decisions made today has the largest relative effect on such long term horizons as stated before.
We can check out the distribution of end values in these cases as well. 

![image](..\..\..\assets\images\StockWithMonthInv.png)

Obviously one could continue simulating such investments as above running in many different cases and for many different time periods, including shorter term ones, but my main focus here was to investigate the importance of early decision making in long-term investments as well as the risks of not taking risk on early in the life cycle of a investment. Hopefully it shoud also be helpful in giving some pointers and ideas on how we can simulate returns for different types of activa, what to expect in terms of returns, how to simulate value at risk and similar financial modeling topics. The code given for the simulations can be amended to test different returns, time periods, asset investment shares, monthly savings and so forth.

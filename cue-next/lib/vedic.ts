// Vedic (sidereal) sign boundaries — approximately 23° behind Western signs
export function getVedicSign(month: number, day: number): string {
  const md = month * 100 + day;
  if (md >= 414 && md <= 514) return 'Aries';       // Mesha:       Apr 14 – May 14
  if (md >= 515 && md <= 614) return 'Taurus';      // Vrishabha:   May 15 – Jun 14
  if (md >= 615 && md <= 715) return 'Gemini';      // Mithuna:     Jun 15 – Jul 15
  if (md >= 716 && md <= 816) return 'Cancer';      // Karka:       Jul 16 – Aug 16
  if (md >= 817 && md <= 916) return 'Leo';         // Simha:       Aug 17 – Sep 16
  if (md >= 917 && md <= 1016) return 'Virgo';      // Kanya:       Sep 17 – Oct 16
  if (md >= 1017 && md <= 1115) return 'Libra';     // Tula:        Oct 17 – Nov 15
  if (md >= 1116 && md <= 1215) return 'Scorpio';   // Vrishchika:  Nov 16 – Dec 15
  if (md >= 1216 || md <= 113) return 'Sagittarius'; // Dhanu:      Dec 16 – Jan 13
  if (md >= 114 && md <= 212) return 'Capricorn';   // Makara:      Jan 14 – Feb 12
  if (md >= 213 && md <= 313) return 'Aquarius';    // Kumbha:      Feb 13 – Mar 13
  return 'Pisces';                                   // Meena:       Mar 14 – Apr 13
}

export const VEDIC: Record<string, string> = {
  Aries: `# Mesha (Aries)

## Personality

### Strengths
- Channeling your natural leadership abilities
- Taking initiative in projects and relationships
- Practicing physical exercise regularly
- Being direct and honest in communication
- Embracing new challenges and adventures
- Trusting your instincts and intuition

### Watch Out For
- Overly impulsive decisions
- Aggressive or dominating behavior
- Dismissing others' opinions
- Starting projects without proper planning
- Letting anger control your actions

## Relationships

### Thrives When
- Being passionate and spontaneous with your partner
- Showing appreciation for your loved ones
- Taking the lead in planning romantic activities
- Being protective of family members
- Expressing your feelings openly

### Watch Out For
- Being too demanding or controlling
- Jealous or possessive behavior
- Rushing into serious commitments
- Neglecting your partner's needs
- Letting ego damage relationships

## Money & Finance

### Attracts Prosperity By
- Investing in growth-oriented schemes
- Taking calculated risks in investments
- Starting your own business ventures
- Investing in real estate and property
- Keeping emergency funds for unexpected moments

### Watch Out For
- Hasty financial decisions
- Borrowing money frequently
- Putting all resources in one investment
- Get-rich-quick schemes
- Ignoring budgeting and planning

## Career

### Advances By
- Taking leadership roles
- Starting your own ventures
- Working in competitive environments
- Focusing on results-oriented positions
- Seeking roles with independence

### Watch Out For
- Routine, monotonous work
- Strict micromanagement
- Careers requiring extreme patience
- Purely analytical roles

### Best Career Fields
- Military and defense services
- Sports and athletics
- Entrepreneurship and business
- Engineering and technology
- Sales and marketing
- Surgery and medicine
- Law enforcement

## Sign Relationships

### Deepest Bond
- **Leo** (Aug 17 – Sep 16) — Shared fire, passion, and the courage to lead; a dynamic and powerfully aligned match
- **Sagittarius** (Dec 16 – Jan 13) — Both seek adventure and truth; an expansive, endlessly inspiring connection

### Natural Allies
- **Gemini** (Jun 15 – Jul 15) — Aries' initiative combined with Gemini's agility creates a fast-moving, inventive partnership
- **Aquarius** (Feb 13 – Mar 13) — Two original thinkers who push each other toward bold new horizons

### Challenging Pairs
- **Cancer** (Jul 16 – Aug 16) — Aries' directness can wound Cancer's deep sensitivity; both must learn each other's language
- **Capricorn** (Jan 14 – Feb 12) — Opposing cardinal signs; Aries moves on instinct while Capricorn calculates every step`,

  Taurus: `# Vrishabha (Taurus)

## Personality

### Strengths
- Valuing stability and security
- Appreciating beauty and luxury
- Being practical in your approach
- Building strong, lasting relationships
- Taking time to make well-considered decisions
- Enjoying sensual pleasures in moderation

### Watch Out For
- Excessive stubbornness
- Resisting necessary changes
- Becoming too materialistic
- Laziness or complacency
- Holding grudges for too long

## Relationships

### Thrives When
- Showing consistent love and affection
- Creating a comfortable home environment
- Being loyal and dependable
- Expressing love through actions
- Valuing long-term commitments

### Watch Out For
- Possessive or jealous behavior
- Being too set in your ways
- Ignoring your partner's emotional needs
- Being overly critical
- Letting stubbornness damage relationships

## Money & Finance

### Attracts Prosperity By
- Focusing on long-term savings
- Investing in stable assets like land and gold
- Building multiple income sources
- Planning for retirement early
- Investing in quality items as lasting assets

### Watch Out For
- Overspending on luxuries
- High-risk investments
- Lending money without security
- Impulsive purchases
- Ignoring the effects of inflation

## Career

### Advances By
- Choosing stable, established organizations
- Focusing on gradual career growth
- Working in comfortable environments
- Building deep expertise in your field
- Valuing work-life balance

### Watch Out For
- High-stress work environments
- Unpredictable careers
- Frequent job changes
- Unstable industries

### Best Career Fields
- Banking and finance
- Agriculture and farming
- Real estate
- Food and hospitality
- Arts and crafts
- Beauty and fashion
- Interior design

## Sign Relationships

### Deepest Bond
- **Virgo** (Sep 17 – Oct 16) — Both grounded and devoted; they build lasting, deeply aligned lives rooted in shared values
- **Capricorn** (Jan 14 – Feb 12) — Shared loyalty, ambition, and security; one of the most naturally compatible pairings in the Vedic chart

### Natural Allies
- **Cancer** (Jul 16 – Aug 16) — Cancer's emotional depth combined with Taurus' steadfast love creates a beautifully nurturing bond
- **Pisces** (Mar 14 – Apr 13) — Taurus provides the grounding that Pisces needs to bring its dreams into reality

### Challenging Pairs
- **Aquarius** (Feb 13 – Mar 13) — Taurus' tradition-oriented nature clashes with Aquarius' drive to disrupt the status quo
- **Leo** (Aug 17 – Sep 16) — Both stubborn and strong-willed; power struggles can arise around control and recognition`,

  Gemini: `# Mithuna (Gemini)

## Personality

### Strengths
- Embracing your versatility
- Continuously learning new skills
- Communicating effectively
- Staying curious and open-minded
- Networking with diverse people
- Adapting to changing situations

### Watch Out For
- Inconsistency in commitments
- Spreading yourself too thin
- Superficiality in relationships
- Excessive restlessness
- Sacrificing depth for variety

## Relationships

### Thrives When
- Maintaining intellectual connections
- Communicating openly with partners
- Keeping relationships interesting and fun
- Being flexible and understanding
- Sharing ideas and thoughts freely

### Watch Out For
- Emotional distance
- Flirtatious or unfaithful behavior
- Changing partners frequently
- Being overly critical
- Neglecting emotional intimacy

## Money & Finance

### Attracts Prosperity By
- Diversifying your income sources
- Investing in technology and communication
- Keeping liquid investments
- Learning about financial markets
- Using technology for money management

### Watch Out For
- Making decisions without proper research
- Putting all money in one investment
- Trusting financial advice blindly
- Overly complex financial products
- Ignoring small recurring expenses

## Career

### Advances By
- Choosing variety in your work
- Working in communication-based roles
- Using your networking skills
- Embracing new technologies
- Seeking intellectual stimulation

### Watch Out For
- Monotonous or repetitive work
- Staying in one role too long
- Isolated work environments
- Neglecting skill development

### Best Career Fields
- Journalism and media
- Sales and marketing
- Technology and software
- Public relations
- Teaching and training
- Writing and content creation
- Event coordination

## Sign Relationships

### Deepest Bond
- **Libra** (Oct 17 – Nov 15) — Two air signs who create a bond of intellectual harmony, social ease, and effortless communication
- **Aquarius** (Feb 13 – Mar 13) — Both visionary and future-oriented; they stimulate and inspire each other endlessly

### Natural Allies
- **Aries** (Apr 14 – May 14) — Aries' boldness energizes Gemini's ideas into real momentum
- **Leo** (Aug 17 – Sep 16) — Leo's warmth and expressiveness combined with Gemini's wit creates a playful and dynamic pairing

### Challenging Pairs
- **Pisces** (Mar 14 – Apr 13) — Gemini's logic clashes with Pisces' emotional depth; communication styles differ fundamentally
- **Virgo** (Sep 17 – Oct 16) — Both Mercury-ruled but operating very differently; Virgo's precision can frustrate Gemini's natural fluidity`,

  Cancer: `# Karka (Cancer)

## Personality

### Strengths
- Trusting your intuition
- Nurturing and caring for others
- Valuing family and home deeply
- Being emotionally supportive
- Creating a secure environment
- Expressing your feelings authentically

### Watch Out For
- Excessive emotionality
- Moodiness or crankiness
- Holding onto past hurts
- Being over-protective
- Retreating when things get tough

## Relationships

### Thrives When
- Showing deep emotional care
- Creating a loving home atmosphere
- Being supportive during tough times
- Valuing family relationships
- Expressing love through nurturing

### Watch Out For
- Clinginess or neediness
- Emotional manipulation
- Repeatedly bringing up past issues
- Being overly sensitive
- Sacrificing yourself completely

## Money & Finance

### Attracts Prosperity By
- Saving for family security
- Investing in home and property
- Planning for children's education
- Keeping insurance policies current
- Building emergency funds

### Watch Out For
- Emotional financial decisions
- Risky investments
- Overspending on family
- Lending money based on emotion
- Ignoring retirement planning

## Career

### Advances By
- Choosing caring professions
- Working in nurturing environments
- Valuing job security
- Helping others through your work
- Maintaining work-life balance

### Watch Out For
- High-stress environments
- Long periods away from family
- Competitive corporate roles
- Ignoring your own emotional needs

### Best Career Fields
- Healthcare and nursing
- Social work and counseling
- Education and childcare
- Hospitality and catering
- Real estate
- Psychology and therapy
- Food and nutrition

## Sign Relationships

### Deepest Bond
- **Scorpio** (Nov 16 – Dec 15) — A deeply bonded water pairing of emotional intensity, loyalty, and shared intuition
- **Pisces** (Mar 14 – Apr 13) — Both feel the world at profound depth; an empathic, spiritual, and deeply nurturing bond

### Natural Allies
- **Taurus** (May 15 – Jun 14) — Taurus' stability gives Cancer the secure home it needs to fully open and thrive
- **Virgo** (Sep 17 – Oct 16) — Both devoted and service-oriented; a bond built on thoughtful, consistent care for each other

### Challenging Pairs
- **Aries** (Apr 14 – May 14) — Aries' directness and impatience can feel threatening to Cancer's sensitive interior world
- **Libra** (Oct 17 – Nov 15) — Cancer's need for emotional depth is often unmet by Libra's preference for light, balanced relating`,

  Leo: `# Simha (Leo)

## Personality

### Strengths
- Embracing your natural leadership
- Being generous and kind
- Showing confidence in your abilities
- Taking center stage when appropriate
- Being creative and expressive
- Maintaining your dignity

### Watch Out For
- Arrogance or boastfulness
- Overly dramatic behavior
- Dominating conversations
- Seeking constant attention
- Letting ego harm relationships

## Relationships

### Thrives When
- Being generous with love and gifts
- Showing appreciation and admiration
- Taking the lead in romantic gestures
- Being loyal and devoted
- Creating grand, memorable moments

### Watch Out For
- Expecting constant praise
- Possessive behavior
- Overshadowing your partner
- Being too demanding
- Letting pride damage relationships

## Money & Finance

### Attracts Prosperity By
- Investing in luxury and quality assets
- Taking leadership in financial planning
- Investing in entertainment and the arts
- Building wealth to support your lifestyle
- Being generous within reasonable limits

### Watch Out For
- Overspending to impress others
- Ego-driven investments
- Ignoring practical financial needs
- Flaunting wealth
- Making emotional purchases

## Career

### Advances By
- Seeking leadership positions
- Working in prestigious organizations
- Using your charisma effectively
- Aiming for recognition and awards
- Inspiring and motivating others

### Watch Out For
- Subordinate or behind-the-scenes roles
- Criticism-heavy work environments
- Mundane, routine work
- Roles that limit self-expression

### Best Career Fields
- Government and administration
- Entertainment and the arts
- Management and leadership
- Politics and public service
- Luxury goods and services
- Event management
- Fashion and design

## Sign Relationships

### Deepest Bond
- **Aries** (Apr 14 – May 14) — Two fire signs who ignite each other; passionate, magnetic, and powerfully aligned
- **Sagittarius** (Dec 16 – Jan 13) — Shared fire, optimism, and grandeur; they encourage each other to dream and live big

### Natural Allies
- **Gemini** (Jun 15 – Jul 15) — Gemini's quick intellect fuels Leo's creative expression; playful and full of natural spark
- **Libra** (Oct 17 – Nov 15) — Leo's charisma combined with Libra's charm creates one of the most socially radiant pairings

### Challenging Pairs
- **Scorpio** (Nov 16 – Dec 15) — Both dominant signs; battles for control and recognition can strain the connection
- **Taurus** (May 15 – Jun 14) — Two fixed signs; stubbornness collides, though the underlying attraction can be powerful`,

  Virgo: `# Kanya (Virgo)

## Personality

### Strengths
- Paying close attention to details
- Maintaining high standards
- Being practical and efficient
- Helping others improve
- Staying organized and systematic
- Focusing on health and wellness

### Watch Out For
- Being overly critical
- Perfectionism that causes paralysis
- Excessive worry
- Being too harsh on yourself
- Nitpicking others constantly

## Relationships

### Thrives When
- Showing love through service
- Being reliable and dependable
- Helping improve your partner's life
- Maintaining healthy relationship habits
- Expressing care through practical means

### Watch Out For
- Constantly criticizing your partner
- Emotional distance
- Expecting perfection from others
- Being overly analytical
- Neglecting romantic gestures

## Money & Finance

### Attracts Prosperity By
- Maintaining detailed financial records
- Making systematic, researched investments
- Planning budgets carefully
- Saving for health emergencies
- Investing in practical, durable assets

### Watch Out For
- Over-analyzing investment options
- Being too financially conservative
- Stressing over minor expenses
- Perfectionist financial planning
- Ignoring growth opportunities

## Career

### Advances By
- Focusing on service-oriented roles
- Using analytical skills effectively
- Maintaining high work standards
- Improving systems and processes
- Prioritizing health and wellness at work

### Watch Out For
- Disorganized work environments
- Taking on too much responsibility
- High-pressure creative roles
- Neglecting work-life balance

### Best Career Fields
- Healthcare and medicine
- Accounting and auditing
- Research and analysis
- Quality control
- Administrative services
- Nutrition and dietetics
- Technical writing

## Sign Relationships

### Deepest Bond
- **Taurus** (May 15 – Jun 14) — Both earthy, devoted, and quality-focused; they understand each other's standards with rare completeness
- **Capricorn** (Jan 14 – Feb 12) — Shared drive for excellence and structure; a bond built on mutual respect and deeply practical love

### Natural Allies
- **Cancer** (Jul 16 – Aug 16) — Cancer's emotional depth complements Virgo's practical service; a quietly devoted and caring match
- **Scorpio** (Nov 16 – Dec 15) — Both precise and purposeful; they appreciate each other's depth and unwavering commitment

### Challenging Pairs
- **Sagittarius** (Dec 16 – Jan 13) — Sagittarius' free spirit conflicts with Virgo's need for detail, reliability, and follow-through
- **Gemini** (Jun 15 – Jul 15) — Both Mercury-ruled but opposing in approach; breadth versus depth creates persistent friction`,

  Libra: `# Tula (Libra)

## Personality

### Strengths
- Seeking balance in all areas
- Being diplomatic and fair
- Appreciating beauty and harmony
- Building partnerships and alliances
- Making decisions collaboratively
- Creating peaceful environments

### Watch Out For
- Prolonged indecisiveness
- Avoiding conflict entirely
- Compromising your core values
- Superficiality
- Over-relying on others

## Relationships

### Thrives When
- Valuing partnership and companionship
- Creating harmony in relationships
- Being romantic and charming
- Compromising when necessary
- Maintaining social connections

### Watch Out For
- Avoiding difficult conversations
- Losing your identity in relationships
- Passive-aggressive behavior
- Excessive people-pleasing
- Ignoring your own needs

## Money & Finance

### Attracts Prosperity By
- Investing in beautiful and artistic items
- Maintaining balanced portfolios
- Partnering with others in investments
- Spending on social and cultural activities
- Keeping finances harmonious with a partner

### Watch Out For
- Making every financial decision alone
- Overspending on luxury
- Ignoring practical investments
- Financial conflicts
- Indecisiveness about money

## Career

### Advances By
- Working in team environments
- Focusing on aesthetic industries
- Using diplomatic skills
- Seeking work-life balance
- Building professional partnerships

### Watch Out For
- High-conflict roles
- Working in isolation
- Making quick, unresearched decisions
- Purely technical roles

### Best Career Fields
- Law and legal services
- Arts and design
- Fashion and beauty
- Diplomacy and public relations
- Counseling and mediation
- Event planning
- Interior design

## Sign Relationships

### Deepest Bond
- **Gemini** (Jun 15 – Jul 15) — Two air signs in effortless harmony; intellectual, social, and deeply companionable
- **Aquarius** (Feb 13 – Mar 13) — Both idealistic and justice-oriented; a visionary partnership built on shared principles

### Natural Allies
- **Leo** (Aug 17 – Sep 16) — Leo's warmth and presence pair beautifully with Libra's grace and natural charm
- **Sagittarius** (Dec 16 – Jan 13) — Both optimistic and idealistic; a bond full of exploration, philosophy, and mutual admiration

### Challenging Pairs
- **Cancer** (Jul 16 – Aug 16) — Cancer's emotional demands can overwhelm Libra's preference for light, balanced relating
- **Capricorn** (Jan 14 – Feb 12) — Pragmatism meets idealism; one values beauty and fairness, the other results and tradition`,

  Scorpio: `# Vrishchika (Scorpio)

## Personality

### Strengths
- Embracing transformation and change
- Trusting your intuition deeply
- Being passionate about your goals
- Investigating and researching thoroughly
- Maintaining loyalty to loved ones
- Using your magnetic personality

### Watch Out For
- Unnecessary secrecy
- Vengeful or spiteful behavior
- Manipulating others
- Extreme jealousy
- Holding grudges indefinitely

## Relationships

### Thrives When
- Building deep, meaningful connections
- Being intensely loyal and devoted
- Sharing your deeper thoughts
- Transforming relationships positively
- Showing passionate love

### Watch Out For
- Being possessive or controlling
- Excessive suspicion
- Emotional manipulation
- Constantly testing partners
- Hiding important feelings

## Money & Finance

### Attracts Prosperity By
- Investing in research and investigation
- Transforming your financial situation
- Investing in insurance and protection
- Using your intuition for investments
- Building wealth through partnerships

### Watch Out For
- Secret financial dealings
- Revenge spending
- Obsessing over money
- Risky hidden investments
- Using money to control others

## Career

### Advances By
- Working in transformative roles
- Using investigative abilities
- Handling crises effectively
- Working with complex or hidden subjects
- Helping others transform their lives

### Watch Out For
- Superficial work environments
- Abusing power or authority
- Purely social roles
- Ignoring your passionate nature

### Best Career Fields
- Investigation and detective work
- Psychology and psychiatry
- Surgery and medicine
- Research and development
- Occult and metaphysical sciences
- Mining and excavation
- Crisis management

## Sign Relationships

### Deepest Bond
- **Cancer** (Jul 16 – Aug 16) — Two water signs bound by emotional depth, loyalty, and a profound intuitive understanding
- **Pisces** (Mar 14 – Apr 13) — A mystical, transformative bond; both feel deeply and navigate the world with rare intensity and purpose

### Natural Allies
- **Virgo** (Sep 17 – Oct 16) — Both meticulous, purposeful, and intensely committed to what they value
- **Capricorn** (Jan 14 – Feb 12) — Shared strategic intensity and ambition; a bond built on mutual power and quiet discipline

### Challenging Pairs
- **Leo** (Aug 17 – Sep 16) — Both strong-willed and dominant; the power dynamic must be carefully and consciously balanced
- **Aquarius** (Feb 13 – Mar 13) — Scorpio's emotional intensity clashes with Aquarius' fundamental emotional detachment`,

  Sagittarius: `# Dhanus (Sagittarius)

## Personality

### Strengths
- Expanding your horizons constantly
- Maintaining an optimistic outlook
- Seeking truth and knowledge
- Traveling and exploring different cultures
- Being honest and straightforward
- Teaching and sharing wisdom

### Watch Out For
- Overly blunt or tactless behavior
- Irresponsibility
- Making promises you can't keep
- Being preachy or dogmatic
- Restraining your freedom too much

## Relationships

### Thrives When
- Giving partners freedom and space
- Sharing adventures and travels
- Being honest about your feelings
- Maintaining optimism in relationships
- Encouraging growth in others

### Watch Out For
- Commitment-phobia
- Being too independent
- Insensitivity to feelings
- Being overly casual
- Ignoring emotional needs

## Money & Finance

### Attracts Prosperity By
- Investing in education and travel
- Taking calculated risks
- Investing internationally
- Spending on experiences over things
- Planning for long-term growth

### Watch Out For
- Reckless gambling
- Overspending on adventures
- Ignoring practical needs
- Get-rich-quick schemes
- Carelessness with money

## Career

### Advances By
- Working in educational fields
- Seeking international opportunities
- Using your philosophical nature
- Working with freedom and flexibility
- Traveling for work when possible

### Watch Out For
- Restrictive environments
- Purely routine jobs
- Micromanaging roles
- Ignoring higher purpose

### Best Career Fields
- Teaching and education
- Travel and tourism
- Publishing and writing
- International business
- Sports and adventure
- Philosophy and religion
- Import-export

## Sign Relationships

### Deepest Bond
- **Aries** (Apr 14 – May 14) — Both fire signs fueled by courage, independence, and a love for the unexplored
- **Leo** (Aug 17 – Sep 16) — Leo's grandeur combined with Sagittarius' expansive vision create something genuinely inspiring

### Natural Allies
- **Aquarius** (Feb 13 – Mar 13) — Both freedom-loving visionaries who respect each other's independence completely
- **Libra** (Oct 17 – Nov 15) — Two optimists who share a love of ideas, beauty, and a genuinely better world

### Challenging Pairs
- **Virgo** (Sep 17 – Oct 16) — Sagittarius' broad strokes clash with Virgo's need for precision, routine, and reliability
- **Pisces** (Mar 14 – Apr 13) — Both mutable and idealistic; without grounding, the connection can drift without direction`,

  Capricorn: `# Makara (Capricorn)

## Personality

### Strengths
- Setting long-term goals and working towards them
- Being disciplined and responsible
- Building a strong reputation
- Valuing tradition and structure
- Working hard for success
- Being practical in your approach

### Watch Out For
- Excessive rigidity or inflexibility
- Pessimism
- Ignoring emotional needs
- Being too status-conscious
- Working without rest or balance

## Relationships

### Thrives When
- Building stable, lasting relationships
- Showing commitment and reliability
- Providing security to loved ones
- Respecting traditions and values
- Expressing love through actions

### Watch Out For
- Emotional distance
- Being too serious at all times
- Prioritizing work over family
- Controlling behavior
- Ignoring romantic gestures

## Money & Finance

### Attracts Prosperity By
- Building wealth systematically
- Investing in traditional assets
- Planning for long-term security
- Saving for retirement
- Investing in status symbols wisely

### Watch Out For
- Being overly conservative
- Excessive frugality
- Ignoring inflation
- Status-driven spending
- Delaying financial planning

## Career

### Advances By
- Climbing the career ladder systematically
- Building authority and respect
- Working in established organizations
- Focusing on long-term career growth
- Taking on leadership responsibilities

### Watch Out For
- Unstable career paths
- Neglecting professional networking
- Purely creative roles
- Changing jobs frequently

### Best Career Fields
- Government and administration
- Corporate management
- Engineering and construction
- Banking and finance
- Law and legal services
- Architecture
- Traditional businesses

## Sign Relationships

### Deepest Bond
- **Taurus** (May 15 – Jun 14) — Both earth signs of loyalty and steady ambition; one of the most naturally enduring matches in Vedic astrology
- **Virgo** (Sep 17 – Oct 16) — Shared commitment to excellence and reliability; a bond built on mutual respect and practical love

### Natural Allies
- **Scorpio** (Nov 16 – Dec 15) — Both strategic, intense, and capable of extraordinary discipline and long-term focus
- **Pisces** (Mar 14 – Apr 13) — Capricorn's structure gives Pisces the stability it needs to manifest its deepest dreams

### Challenging Pairs
- **Aries** (Apr 14 – May 14) — Capricorn's caution and Aries' boldness pull in fundamentally opposite directions
- **Libra** (Oct 17 – Nov 15) — Capricorn's hard practicality can feel cold against Libra's romantic and idealistic nature`,

  Aquarius: `# Kumbha (Aquarius)

## Personality

### Strengths
- Embracing innovation and technology
- Thinking independently and originally
- Working for humanitarian causes
- Valuing friendship and community
- Being progressive in outlook
- Supporting social reforms

### Watch Out For
- Emotional detachment
- Excessive rebelliousness
- Ignoring practical matters
- Unpredictable behavior
- Alienating others with radical views

## Relationships

### Thrives When
- Valuing friendship as a foundation
- Giving partners space and freedom
- Supporting individual growth
- Being intellectually stimulating
- Working together for shared causes

### Watch Out For
- Emotional unavailability
- Being too independent
- Ignoring romantic needs
- Unpredictable behavior
- Prioritizing causes over family

## Money & Finance

### Attracts Prosperity By
- Investing in technology and innovation
- Supporting social and environmental causes
- Using modern financial tools
- Investing in group or community projects
- Planning for future generations

### Watch Out For
- Ignoring traditional investments
- Being too experimental with finances
- Following trends blindly
- Unpredictable spending patterns
- Ignoring family financial needs

## Career

### Advances By
- Working in cutting-edge fields
- Using technology effectively
- Working for social causes
- Collaborating with groups and teams
- Thinking outside the box

### Watch Out For
- Traditional corporate environments
- Isolated work
- Purely profit-driven roles
- Neglecting team dynamics

### Best Career Fields
- Technology and innovation
- Social work and NGOs
- Science and research
- Aviation and space
- Electronics and computers
- Alternative healing
- Environmental work

## Sign Relationships

### Deepest Bond
- **Gemini** (Jun 15 – Jul 15) — Two air signs with a natural intellectual and social electricity between them
- **Libra** (Oct 17 – Nov 15) — Both idealistic and principled; a visionary pairing driven by a genuine desire to make the world better

### Natural Allies
- **Sagittarius** (Dec 16 – Jan 13) — Both fiercely independent and open-minded; they give each other the freedom to grow
- **Aries** (Apr 14 – May 14) — Aquarius' innovation combined with Aries' initiative creates a bold, forward-moving force

### Challenging Pairs
- **Scorpio** (Nov 16 – Dec 15) — Aquarius' detachment clashes with Scorpio's need for emotional depth and intensity
- **Taurus** (May 15 – Jun 14) — Opposite values at their core; Aquarius disrupts what Taurus protects, creating friction without compromise`,

  Pisces: `# Meena (Pisces)

## Personality

### Strengths
- Trusting your intuition and psychic abilities
- Being compassionate and empathetic
- Expressing creativity and imagination
- Helping those in need
- Practicing spirituality and meditation
- Going with the flow

### Watch Out For
- Excessive emotionality or moodiness
- Escaping reality through substances
- Playing the victim or martyr role
- Being overly trusting
- Neglecting practical matters

## Relationships

### Thrives When
- Showing unconditional love and compassion
- Being emotionally supportive
- Creating romantic and dreamy moments
- Being understanding and forgiving
- Sharing spiritual experiences

### Watch Out For
- Clinginess or dependency
- Over-sacrificing yourself
- Ignoring red flags
- Emotional manipulation
- Losing yourself in relationships

## Money & Finance

### Attracts Prosperity By
- Investing in spiritual and healing arts
- Using intuition for investment timing
- Donating to charitable causes
- Investing in water-related businesses
- Keeping some liquid savings

### Watch Out For
- Emotional financial decisions
- Being too generous with strangers
- Trusting financial advice blindly
- Risky speculative investments
- Ignoring budgeting entirely

## Career

### Advances By
- Working in creative or healing fields
- Using your intuitive abilities
- Helping others through your work
- Working in flexible environments
- Expressing your artistic nature

### Watch Out For
- High-stress competitive roles
- Purely logical, analytical work
- Rigid corporate structures
- Ignoring your creative needs

### Best Career Fields
- Arts and entertainment
- Healing and alternative medicine
- Social work and charity
- Spirituality and counseling
- Photography and film
- Marine biology
- Music and dance

## Sign Relationships

### Deepest Bond
- **Cancer** (Jul 16 – Aug 16) — Both water signs of deep feeling and intuitive understanding; a profoundly nurturing and empathic bond
- **Scorpio** (Nov 16 – Dec 15) — A mystical and transformative pairing; both navigate the unseen world with rare depth and shared intensity

### Natural Allies
- **Taurus** (May 15 – Jun 14) — Taurus provides the secure grounding that Pisces needs to make its visions real
- **Capricorn** (Jan 14 – Feb 12) — Capricorn's practical love gives Pisces a safe container for its boundless creative and emotional energy

### Challenging Pairs
- **Gemini** (Jun 15 – Jul 15) — Gemini's intellect and detachment can leave Pisces' emotional world feeling unseen and unmet
- **Sagittarius** (Dec 16 – Jan 13) — Both mutable and idealistic; when neither takes responsibility, neither truly thrives`,
};

// Celtic Tree Astrology — 13 signs based on the Celtic calendar
export const CELTIC_SYMBOLS: Record<string, string> = {
  Birch:    'ᚁ',
  Rowan:    'ᚂ',
  Ash:      'ᚅ',
  Alder:    'ᚃ',
  Willow:   'ᚄ',
  Hawthorn: 'ᚆ',
  Oak:      'ᚇ',
  Holly:    'ᚈ',
  Hazel:    'ᚉ',
  Vine:     'ᚋ',
  Ivy:      'ᚌ',
  Reed:     'ᚍ',
  Elder:    'ᚏ',
};

export function getCelticSign(month: number, day: number): string {
  const md = month * 100 + day;
  if (md >= 1224 || md <= 120) return 'Birch';     // Dec 24 – Jan 20
  if (md >= 121  && md <= 217) return 'Rowan';     // Jan 21 – Feb 17
  if (md >= 218  && md <= 317) return 'Ash';       // Feb 18 – Mar 17
  if (md >= 318  && md <= 414) return 'Alder';     // Mar 18 – Apr 14
  if (md >= 415  && md <= 512) return 'Willow';    // Apr 15 – May 12
  if (md >= 513  && md <= 609) return 'Hawthorn';  // May 13 – Jun 9
  if (md >= 610  && md <= 707) return 'Oak';       // Jun 10 – Jul 7
  if (md >= 708  && md <= 804) return 'Holly';     // Jul 8  – Aug 4
  if (md >= 805  && md <= 901) return 'Hazel';     // Aug 5  – Sep 1
  if (md >= 902  && md <= 929) return 'Vine';      // Sep 2  – Sep 29
  if (md >= 930  && md <= 1027) return 'Ivy';      // Sep 30 – Oct 27
  if (md >= 1028 && md <= 1124) return 'Reed';     // Oct 28 – Nov 24
  return 'Elder';                                   // Nov 25 – Dec 23
}

export const CELTIC: Record<string, string> = {
  Birch: `# Birch — The Achiever
### Dec 24 – Jan 20 · Ogham: ᚁ Beith

Birch is the first tree of the Celtic year — a symbol of renewal, drive, and new beginnings. Those born under Birch are natural achievers who rise through adversity and inspire others by example.

## Personality

### Strengths
- Highly ambitious and goal-oriented
- Resilient and hard to discourage
- Natural leader with quiet authority
- Tolerant, cool under pressure
- Energetic and endlessly motivated
- Practical and results-driven

### Watch Out For
- Becoming a workaholic at the cost of relationships
- Inflexibility when challenged
- Coldness or emotional unavailability
- Dismissing others who can't match your pace
- Taking on too much without asking for help

## Relationships

### Thrives When
- Partnered with someone equally driven
- Given space to pursue personal ambitions
- Building something meaningful together
- Feeling admired and respected
- Leading in love with purpose and care

### Watch Out For
- Neglecting emotional connection in pursuit of goals
- Being too critical of a partner's pace
- Using productivity as emotional armor
- Forgetting to slow down and be present
- Letting work become more important than intimacy

## Money & Finance

### Attracts Prosperity By
- Setting long-term financial goals and pursuing them relentlessly
- Building wealth through discipline and consistency
- Investing in ventures that align with personal drive
- Leading projects and reaping the rewards
- Turning setbacks into stepping stones

### Watch Out For
- Overextending in ambition without financial planning
- Ignoring rest and burning out before the payoff
- Being too proud to seek financial advice
- Ruthless decisions that damage long-term reputation
- Letting status drive spending beyond means

## Career

### Advances By
- Taking on leadership roles early
- Setting and exceeding ambitious targets
- Building a reputation for reliability and excellence
- Mentoring others while continuing to grow
- Pursuing mastery in a chosen field

### Watch Out For
- Steamrolling colleagues in competitive environments
- Staying in unfulfilling work just for status
- Avoiding collaboration out of self-reliance
- Burning bridges when climbing the ladder

### Best Career Fields
- Executive leadership and management
- Entrepreneurship and startups
- Law and corporate strategy
- Finance and investment
- Athletics and coaching
- Military and public service
- Real estate development

## Sign Relationships

### Deepest Bond
- **Vine** (Sep 2 – Sep 29) — Vine's grace and discernment perfectly balance Birch's drive; together they build something refined and genuinely lasting
- **Willow** (Apr 15 – May 12) — Willow's deep patience grounds Birch's ambition without ever dimming it; a quietly powerful match

### Natural Allies
- **Alder** (Mar 18 – Apr 14) — Two trailblazers who accomplish extraordinary things when their energies align
- **Ivy** (Sep 30 – Oct 27) — Ivy's loyalty gives Birch the unwavering support it needs to keep climbing

### Challenging Pairs
- **Holly** (Jul 8 – Aug 4) — Two powerful forces that must consciously negotiate who leads
- **Elder** (Nov 25 – Dec 23) — Elder's need for absolute freedom chafes against Birch's structured, goal-oriented drive`,

  Rowan: `# Rowan — The Thinker
### Jan 21 – Feb 17 · Ogham: ᚂ Luis

Rowan is a tree of vision and transformation. Those born under Rowan are original thinkers who see the world differently. They are quietly philosophical, deeply creative, and driven by a desire to understand and improve what exists.

## Personality

### Strengths
- Visionary and ahead of their time
- Cool-headed and logical under pressure
- Deeply original and philosophical
- Strong sense of personal ethics
- Inspiring to others through ideas alone
- Open-minded and intellectually curious

### Watch Out For
- Coming across as emotionally detached
- Getting lost in abstract ideas without action
- Dismissing practical concerns as beneath you
- Difficulty connecting with less intellectual types
- Impatience with those who resist new ideas

## Relationships

### Thrives When
- Partnered with an intellectual equal
- Sharing ideas, beliefs, and visions freely
- Given independence without jealousy
- Building a relationship around shared purpose
- Feeling mentally stimulated and respected

### Watch Out For
- Prioritizing ideas over emotional needs
- Being too rational when warmth is needed
- Withdrawing when emotions become intense
- Expecting partners to adapt to your worldview
- Underestimating the value of simple connection

## Money & Finance

### Attracts Prosperity By
- Investing in innovation and emerging fields
- Turning original ideas into income streams
- Building passive wealth through intellectual property
- Staying ahead of trends with sharp foresight
- Collaborating with others to bring visions to life

### Watch Out For
- Overthinking investment decisions until opportunity passes
- Dismissing traditional financial wisdom entirely
- Idealistic ventures without practical financial grounding
- Undervaluing your own intellectual contributions
- Neglecting financial planning while lost in ideas

## Career

### Advances By
- Working in fields that reward original thought
- Challenging established systems with new models
- Building expertise in emerging or visionary areas
- Communicating ideas that inspire and shift thinking
- Contributing to causes larger than personal gain

### Watch Out For
- Roles that require conformity over creativity
- Environments that punish unconventional thinking
- Isolation from collaboration and diverse input
- Letting perfectionism delay meaningful output

### Best Career Fields
- Science, research, and innovation
- Technology and artificial intelligence
- Philosophy and academia
- Social reform and humanitarian work
- Writing and thought leadership
- Design and architecture
- Psychology and human behavior

## Sign Relationships

### Deepest Bond
- **Hawthorn** (May 13 – Jun 9) — Two visionary minds in constant conversation; ideas spark between them and neither ever runs out of things to discover
- **Elder** (Nov 25 – Dec 23) — Both free-thinking philosophers who respect each other's independence and inspire each other to go further

### Natural Allies
- **Ivy** (Sep 30 – Oct 27) — Ivy's emotional warmth opens Rowan's cool intellect to genuine, lasting connection
- **Ash** (Feb 18 – Mar 17) — Ash's imagination combined with Rowan's logic creates a creatively brilliant pairing

### Challenging Pairs
- **Holly** (Jul 8 – Aug 4) — Holly's need for dominance clashes with Rowan's fierce intellectual independence
- **Oak** (Jun 10 – Jul 7) — Tradition versus innovation; both must stretch meaningfully to find common ground`,

  Ash: `# Ash — The Enchanter
### Feb 18 – Mar 17 · Ogham: ᚅ Nion

Ash is the tree of imagination and inner worlds. Those born under Ash are enchanting, artistic, and deeply intuitive. They bridge the visible and invisible, drawing inspiration from realms others can't easily access.

## Personality

### Strengths
- Highly imaginative and creatively gifted
- Deeply intuitive and spiritually aware
- Enchanting presence that draws people in
- Flexible and open to all possibilities
- Empathetic and able to feel others deeply
- Inspired thinker who connects the dots others miss

### Watch Out For
- Retreating into fantasy when reality gets hard
- Moodiness and emotional unpredictability
- Indecision when too many paths seem equally valid
- Absorbing the emotions of others too deeply
- Difficulty finishing what inspiration starts

## Relationships

### Thrives When
- Given creative freedom within the relationship
- Partnered with someone grounded and nurturing
- Sharing artistic, spiritual, or imaginative pursuits
- Feeling safe enough to be emotionally open
- Loved without condition or expectation of practicality

### Watch Out For
- Idealizing partners and being disappointed by reality
- Withdrawing emotionally without explanation
- Letting imagination create problems that don't exist
- Emotional dependency on a partner's stability
- Sacrificing personal needs to keep the peace

## Money & Finance

### Attracts Prosperity By
- Monetizing creative and artistic gifts
- Trusting intuition when evaluating opportunities
- Building income around imagination and originality
- Collaborating with practical partners who ground ideas
- Investing in beauty, healing, and spiritual fields

### Watch Out For
- Impractical financial decisions made on feeling alone
- Avoiding structure and budgeting out of resistance
- Underpricing creative work out of self-doubt
- Being swayed by others' financial opinions too easily
- Letting emotional states drive spending cycles

## Career

### Advances By
- Following creative instincts into meaningful work
- Working in environments that prize imagination
- Using empathy and vision as professional tools
- Building a body of work over time with consistency
- Channeling spiritual depth into practical output

### Watch Out For
- Environments that demand rigid structure over flow
- Work that numbs the senses and dulls imagination
- Isolation without creative community or feedback
- Abandoning projects mid-way when inspiration fades

### Best Career Fields
- Visual arts, music, and film
- Writing and poetry
- Healing arts and holistic therapy
- Spirituality and metaphysics
- Photography and design
- Counseling and psychology
- Marine and environmental science

## Sign Relationships

### Deepest Bond
- **Willow** (Apr 15 – May 12) — Two deep intuitives who understand each other without needing to explain; a quietly magical and profoundly empathic bond
- **Reed** (Oct 28 – Nov 24) — Reed's intense truth-seeking draws out Ash's hidden depths in a genuinely transformative way

### Natural Allies
- **Alder** (Mar 18 – Apr 14) — Alder's groundedness gives Ash direction without clipping its wings
- **Rowan** (Jan 21 – Feb 17) — Both visionaries; Rowan adds logic to Ash's imaginative world, and Ash adds wonder to Rowan's thinking

### Challenging Pairs
- **Hawthorn** (May 13 – Jun 9) — Both changeable; when neither anchors the other they drift beautifully but build nothing
- **Vine** (Sep 2 – Sep 29) — A moody, beautiful pairing that needs an outside source of stability to endure`,

  Alder: `# Alder — The Trailblazer
### Mar 18 – Apr 14 · Ogham: ᚃ Fearn

Alder grows at the edge of water — a pioneer on uncertain ground. Those born under Alder are confident trailblazers who carve new paths and refuse to wait for permission to move forward.

## Personality

### Strengths
- Charismatic and magnetically confident
- Self-reliant and decisive under pressure
- Natural mover and shaker who gets things done
- Focused and strategic in pursuit of goals
- Inspires loyalty and action in others
- Courageous — embraces risk others avoid

### Watch Out For
- Impatience with those who move at a different pace
- Combativeness when challenged or opposed
- Overconfidence leading to poorly calculated risks
- Difficulty delegating or trusting others to lead
- Burning out from constant forward momentum

## Relationships

### Thrives When
- Partnered with someone confident in their own identity
- Mutual respect and independence are the foundation
- Leading in love while also making space for the other
- Building something meaningful together
- Feeling admired without needing to compete

### Watch Out For
- Dominating the relationship dynamic unconsciously
- Losing patience when a partner needs more time
- Treating relationships as another goal to conquer
- Emotional unavailability during high-pressure periods
- Confusing love with competition or challenge

## Money & Finance

### Attracts Prosperity By
- Launching ventures ahead of the curve
- Making bold financial moves backed by research
- Building wealth through initiative and first-mover advantage
- Investing in leadership positions and equity stakes
- Creating multiple income streams with entrepreneurial instincts

### Watch Out For
- Impulsive financial decisions made in the heat of ambition
- Dismissing caution as weakness
- Taking on too many projects simultaneously
- Letting ego override sound financial judgment
- Overinvesting in personal ventures without diversification

## Career

### Advances By
- Leading from the front in competitive environments
- Pioneering new approaches in established fields
- Building teams and inspiring others to excel
- Pursuing positions of autonomy and authority
- Taking calculated risks that pay long-term dividends

### Watch Out For
- Micromanaging instead of trusting the team
- Restlessness in stable, slow-paced environments
- Short-term thinking driven by the need for action
- Burning bridges when momentum stalls

### Best Career Fields
- Entrepreneurship and venture creation
- Military and law enforcement
- Politics and public leadership
- Sports and athletics
- Sales, marketing, and business development
- Film and media production
- Construction and development

## Sign Relationships

### Deepest Bond
- **Hawthorn** (May 13 – Jun 9) — Hawthorn's wit and adaptability electrifies Alder's drive; a dynamic partnership that generates real momentum
- **Oak** (Jun 10 – Jul 7) — Oak's steady protectiveness complements Alder's bold front perfectly; powerful and enduring

### Natural Allies
- **Elder** (Nov 25 – Dec 23) — Two adventurous spirits who push each other toward brave new territory
- **Holly** (Jul 8 – Aug 4) — Both dominant and visionary; when their goals align they can accomplish extraordinary things

### Challenging Pairs
- **Willow** (Apr 15 – May 12) — Alder's relentless pace overwhelms Willow's need for stillness and reflection
- **Ivy** (Sep 30 – Oct 27) — Alder's drive for independence conflicts with Ivy's deep need for consistent presence`,

  Willow: `# Willow — The Observer
### Apr 15 – May 12 · Ogham: ᚄ Saille

Willow bends without breaking, deeply rooted near water and sky. Those born under Willow are quietly powerful — highly intuitive, emotionally intelligent, and capable of seeing what others overlook entirely.

## Personality

### Strengths
- Deeply intuitive, almost psychic in perception
- Highly intelligent with excellent recall
- Patient and willing to wait for the right moment
- Creatively gifted across many forms of expression
- Realistic — grounds vision in what is actually possible
- Loyal and dependable to those they trust

### Watch Out For
- Cynicism when intuition is repeatedly ignored by others
- Moodiness and emotional withdrawal
- Holding onto grudges longer than serves you
- Suppressing feelings until they overflow
- Self-doubt that undercuts undeniable talent

## Relationships

### Thrives When
- Given deep trust and emotional safety
- Partnered with someone patient and emotionally open
- Sharing a private, intimate world together
- Feeling seen for their depth, not just surface charm
- Allowed to process at their own pace

### Watch Out For
- Testing partners through emotional withdrawal
- Overanalyzing gestures and intentions
- Letting moodiness push away those who care
- Building walls after past hurt without communicating
- Sacrificing needs for long stretches before breaking

## Money & Finance

### Attracts Prosperity By
- Trusting instincts on timing for financial decisions
- Building wealth steadily through patience and strategy
- Investing in creative, educational, or healing ventures
- Turning intuitive insight into practical income
- Waiting for the right opportunity rather than forcing it

### Watch Out For
- Letting fear of loss prevent smart investment
- Holding resources too tightly out of insecurity
- Emotional spending as a response to low moods
- Ignoring financial advice out of private stubbornness
- Underestimating the long-term value of consistency

## Career

### Advances By
- Working in fields that value depth over speed
- Using intuitive intelligence as a professional edge
- Building quiet expertise that speaks louder over time
- Trusting gut instincts in creative and strategic decisions
- Creating environments of insight and careful observation

### Watch Out For
- Environments that demand constant visible performance
- Fast-paced work that leaves no room for reflection
- Teams that dismiss intuitive or emotional intelligence
- Staying in toxic environments longer than is wise

### Best Career Fields
- Psychology and counseling
- Education and research
- Writing and literature
- Healing arts and holistic wellness
- History, archaeology, and anthropology
- Music and fine arts
- Environmental science and conservation

## Sign Relationships

### Deepest Bond
- **Ash** (Feb 18 – Mar 17) — Two deeply intuitive souls who sense what others cannot; a quietly magical bond of mutual understanding
- **Ivy** (Sep 30 – Oct 27) — Willow's insight combined with Ivy's loyalty creates one of the most emotionally attuned pairings in the Celtic tree

### Natural Allies
- **Birch** (Dec 24 – Jan 20) — Birch's clear direction gives Willow's depth somewhere purposeful to go
- **Hazel** (Aug 5 – Sep 1) — Hazel brings structure where Willow brings feeling; together, intellect and intuition form a complete picture

### Challenging Pairs
- **Holly** (Jul 8 – Aug 4) — Holly's assertiveness can inadvertently overwhelm Willow's sensitive interior world
- **Alder** (Mar 18 – Apr 14) — Fundamentally different rhythms; both must work to genuinely meet each other in the middle`,

  Hawthorn: `# Hawthorn — The Illusionist
### May 13 – Jun 9 · Ogham: ᚆ Huath

Hawthorn conceals beauty beneath its thorns — unpredictable, multi-layered, and rarely what it first appears. Those born under Hawthorn are fascinating contradictions: witty and curious, restless and creative, with an interior life far richer than they reveal.

## Personality

### Strengths
- Multi-dimensional thinker with wide-ranging interests
- Quick wit and genuine humor that disarms others
- Highly adaptable and comfortable with change
- Insatiably curious — a lifelong learner
- Creative problem-solver who thrives on novelty
- Charismatic and effortlessly engaging in conversation

### Watch Out For
- Restlessness that prevents deep commitment
- Contradicting yourself without realizing it
- Hiding vulnerability behind performance and humor
- Spreading attention too thin across too many pursuits
- Using cleverness to avoid difficult truths

## Relationships

### Thrives When
- Partnered with someone curious and flexible
- Freedom to explore independently within the relationship
- Constant conversation, discovery, and laughter
- Feeling genuinely interesting to a partner
- Avoiding rigid expectations or repetitive routine

### Watch Out For
- Charm used as a substitute for real vulnerability
- Difficulty settling when something new always beckons
- Leaving partners guessing rather than communicating
- Restlessness that manifests as emotional unavailability
- Starting intense connections that fade before depth forms

## Money & Finance

### Attracts Prosperity By
- Capitalizing on versatility and multiple skill sets
- Pivoting quickly when opportunities shift
- Building income through communication and creativity
- Using wit and adaptability in client-facing roles
- Diversifying income sources to match varied interests

### Watch Out For
- Financial inconsistency driven by shifting focus
- Spending on novelty before basics are secured
- Underestimating the value of long-term financial commitment
- Dismissing financial planning as dull and constraining
- Impulsive decisions made during restless periods

## Career

### Advances By
- Thriving in dynamic, fast-changing environments
- Bringing creativity and humor to problem-solving
- Connecting ideas across fields in original ways
- Building a career that evolves rather than stays static
- Using communication gifts to influence and lead

### Watch Out For
- Monotonous work that deadens curiosity
- Environments that punish non-conformity
- Committing to one path before fully exploring options
- Losing focus just before breakthrough moments

### Best Career Fields
- Media, journalism, and broadcasting
- Comedy, acting, and entertainment
- Marketing and advertising
- Teaching and education
- Technology and UX design
- Consulting and strategy
- Travel and cultural industries

## Sign Relationships

### Deepest Bond
- **Rowan** (Jan 21 – Feb 17) — Two original thinkers who challenge and delight each other; rarely a dull moment and never a shallow one
- **Hazel** (Aug 5 – Sep 1) — Hazel's precision combined with Hawthorn's breadth creates a brilliance that covers every possible angle

### Natural Allies
- **Alder** (Mar 18 – Apr 14) — Bold and dynamic together; they bring out each other's courage and sense of possibility
- **Elder** (Nov 25 – Dec 23) — Both free-spirited and curious; an adventurous, ever-evolving bond built on shared wonder

### Challenging Pairs
- **Oak** (Jun 10 – Jul 7) — Hawthorn's restlessness chafes against Oak's deep need for rooted stability
- **Birch** (Dec 24 – Jan 20) — Birch's demand for consistency conflicts with Hawthorn's need to keep everything fluid and open`,

  Oak: `# Oak — The Stabilizer
### Jun 10 – Jul 7 · Ogham: ᚇ Duir

Oak is the king of trees — ancient, enduring, and deeply protective. Those born under Oak are natural nurturers and guardians who hold space for others while standing firm in their own convictions.

## Personality

### Strengths
- Deeply nurturing and protective of loved ones
- Optimistic with unshakeable belief in possibility
- Generous to a fault — gives freely and sincerely
- Idealistic but grounded in real-world action
- Natural authority earned through integrity
- Helpful and dependable in any crisis

### Watch Out For
- Overprotectiveness that can feel controlling
- Stubbornness about established beliefs and traditions
- Carrying others' burdens as your own indefinitely
- Difficulty letting others fail and learn on their own
- Overindulging those you love at personal expense

## Relationships

### Thrives When
- Building a stable, family-centered partnership
- Protecting and nurturing a partner who reciprocates
- Sharing optimism and a common vision for the future
- Feeling needed, valued, and genuinely appreciated
- Creating a safe, lasting home together

### Watch Out For
- Taking on a parental role with romantic partners
- Giving too much while neglecting your own needs
- Resisting change in the relationship when growth demands it
- Choosing stability over genuine compatibility
- Expecting loyalty and being blindsided when it fails

## Money & Finance

### Attracts Prosperity By
- Building long-term wealth through steady, reliable effort
- Investing in real assets — property, education, community
- Protecting financial resources with careful planning
- Creating generational wealth with family in mind
- Turning generosity into reputation and opportunity

### Watch Out For
- Overextending financially to support others
- Being too conservative with investments out of fear of loss
- Trusting the wrong people out of generosity
- Ignoring personal financial needs to fund others' goals
- Status-based spending tied to the need to appear strong

## Career

### Advances By
- Taking on roles that combine leadership with service
- Building institutions, teams, and communities
- Earning trust through consistency and dependability
- Using natural authority to advocate for others
- Staying the course when others would abandon ship

### Watch Out For
- Environments that exploit generous and giving natures
- Roles that offer no impact on real people's lives
- Taking on more responsibility than is sustainable
- Burnout from constant carrying without reciprocity

### Best Career Fields
- Healthcare and medicine
- Law and public advocacy
- Education and mentorship
- Social work and community leadership
- Architecture and urban planning
- Environmental conservation
- Non-profit and humanitarian work

## Sign Relationships

### Deepest Bond
- **Alder** (Mar 18 – Apr 14) — Alder's pioneering energy combined with Oak's steady foundation creates an unstoppable partnership
- **Reed** (Oct 28 – Nov 24) — Reed's depth and purposefulness resonate powerfully with Oak's protective, mission-driven nature

### Natural Allies
- **Holly** (Jul 8 – Aug 4) — Two signs of power and authority; when their visions align they build something that lasts
- **Ivy** (Sep 30 – Oct 27) — Both deeply caring and loyal; a nurturing, enduring bond of genuine mutual support

### Challenging Pairs
- **Hawthorn** (May 13 – Jun 9) — Hawthorn's restlessness frustrates Oak's desire for deep-rooted stability and consistency
- **Rowan** (Jan 21 – Feb 17) — Oak's reverence for tradition conflicts with Rowan's persistent desire to reinvent what already exists`,

  Holly: `# Holly — The Ruler
### Jul 8 – Aug 4 · Ogham: ᚈ Tinne

Holly bears its fruit in darkness and stands regal through winter — a symbol of power and sovereignty. Those born under Holly are natural rulers with commanding presence, competitive drive, and a desire to rise to the top of whatever they pursue.

## Personality

### Strengths
- Naturally commanding and authoritative
- Deeply competitive and driven to excel
- Noble in character with a strong moral code
- Confident in pursuing ambitious goals
- Loyal and fiercely protective of those in their circle
- Capable of remarkable focus and discipline

### Watch Out For
- Arrogance that alienates those who could help you
- Jealousy when others succeed in areas you value
- Demanding too much from others without recognition
- Pride that makes it difficult to admit mistakes
- Using power to control rather than to lead

## Relationships

### Thrives When
- Admired and genuinely respected by a partner
- Given loyalty without question in return for fierce devotion
- Building a relationship that feels like a true alliance
- Leading in love while honoring a partner's own power
- Sharing ambitions and a vision for a powerful life together

### Watch Out For
- Possessiveness disguised as protection
- Making partners compete for your attention or approval
- Expecting devotion without offering equal vulnerability
- Pride preventing genuine apology or reconciliation
- Choosing partners for status rather than true connection

## Money & Finance

### Attracts Prosperity By
- Building wealth through bold, decisive leadership
- Investing in ventures with long-term power and influence
- Leveraging status and reputation as financial assets
- Creating income tied to mastery and excellence
- Protecting earnings with the same intensity as earning them

### Watch Out For
- Ego-driven financial decisions made to impress others
- Spending on luxury to maintain an image beyond your means
- Competition with peers leading to unwise financial risk
- Trusting loyalty over competence in financial partners
- Ignoring financial advice out of pride

## Career

### Advances By
- Rising to leadership positions with determination
- Building a reputation for excellence and command
- Inspiring teams through high standards and dedication
- Taking on ambitious projects others hesitate to attempt
- Using competitive drive to break records and ceilings

### Watch Out For
- Environments where your authority is constantly undermined
- Roles that require permanent submission to others' vision
- Dismissing collaboration as weakness
- Burning through teams with overly high expectations

### Best Career Fields
- Executive and C-suite leadership
- Politics and governance
- Entertainment and performing arts
- Military command and strategy
- Finance and investment banking
- Luxury brand management
- Sports and athletic coaching

## Sign Relationships

### Deepest Bond
- **Vine** (Sep 2 – Sep 29) — Vine's refinement and grace match Holly's regality perfectly; an elegantly powerful and genuinely complementary union
- **Elder** (Nov 25 – Dec 23) — Both wild and sovereign in their own right; the chemistry is electric and the connection runs deep

### Natural Allies
- **Alder** (Mar 18 – Apr 14) — Two dominant forces who accomplish extraordinary things when their ambitions align
- **Oak** (Jun 10 – Jul 7) — Oak's steady authority complements Holly's brilliance without competing with it

### Challenging Pairs
- **Birch** (Dec 24 – Jan 20) — Two natural leaders who must consciously decide to share the stage rather than compete for it
- **Willow** (Apr 15 – May 12) — Holly's assertive nature can inadvertently overwhelm Willow's quiet, sensitive interior`,

  Hazel: `# Hazel — The Knower
### Aug 5 – Sep 1 · Ogham: ᚉ Coll

In Celtic tradition, Hazel was the tree of wisdom — its nuts said to hold all knowledge of the world. Those born under Hazel are naturally brilliant, analytical, and driven to understand everything at its deepest level.

## Personality

### Strengths
- Exceptionally intelligent and analytically gifted
- Highly organized with sharp attention to detail
- Efficient and precise in everything they undertake
- Excellent memory and pattern recognition
- Reliable and trustworthy to the core
- Constantly seeking knowledge and improvement

### Watch Out For
- Perfectionism that creates paralysis or chronic dissatisfaction
- Overcritical of self and others to damaging degrees
- Anxiety from trying to control uncontrollable outcomes
- Dismissing intuition in favor of data alone
- Difficulty relaxing when the mind never stops analyzing

## Relationships

### Thrives When
- Partnered with someone who values intelligence and depth
- Sharing clear communication and mutual respect
- Building a structured, intentional life together
- Feeling secure enough to release the need for control
- Given appreciation for the care and effort invested daily

### Watch Out For
- Criticizing partners in the name of improvement
- Emotional unavailability masked as logical reasoning
- Expecting perfection in a partner as you expect of yourself
- Overanalyzing the relationship until joy evaporates
- Withdrawing when emotions override rational understanding

## Money & Finance

### Attracts Prosperity By
- Systematic, well-researched financial planning
- Building wealth through expertise and mastery
- Turning knowledge into consulting, teaching, or advisory income
- Investing with precision and thorough due diligence
- Maintaining detailed financial records and tracking

### Watch Out For
- Over-analyzing opportunities until timing passes
- Excessive conservatism that leaves growth on the table
- Stress and anxiety over minor financial fluctuations
- Perfectionist planning that delays implementation
- Undervaluing your knowledge as a commodity

## Career

### Advances By
- Becoming the undisputed expert in a specialized field
- Applying analytical intelligence to solve complex problems
- Building systems that improve efficiency at scale
- Using research and detail-oriented skills as a competitive edge
- Communicating complex ideas with exceptional clarity

### Watch Out For
- Environments of chaos, inefficiency, or poor standards
- Work that requires broad generalism over deep expertise
- Teams that dismiss accuracy and detail as unnecessary
- Taking on management without clear systems in place

### Best Career Fields
- Medicine and healthcare research
- Law and forensic analysis
- Accounting, auditing, and financial analysis
- Academia and scientific research
- Data science and technology
- Editing and technical writing
- Architecture and precision engineering

## Sign Relationships

### Deepest Bond
- **Vine** (Sep 2 – Sep 29) — A shared love of quality, discernment, and depth; they understand each other's exacting standards intimately
- **Reed** (Oct 28 – Nov 24) — Both truth-seekers and investigators; a relentlessly insightful, purposeful bond that keeps uncovering new layers

### Natural Allies
- **Hawthorn** (May 13 – Jun 9) — Hawthorn's imaginative range pairs beautifully with Hazel's analytical depth; they cover every angle together
- **Willow** (Apr 15 – May 12) — Hazel's precision combined with Willow's intuition creates powerful emotional and intellectual intelligence

### Challenging Pairs
- **Elder** (Nov 25 – Dec 23) — Elder's resistance to structure conflicts with Hazel's deep need for order and clear systems
- **Holly** (Jul 8 – Aug 4) — Holly's reliance on instinct and presence frustrates Hazel's need to understand everything rationally`,

  Vine: `# Vine — The Equalizer
### Sep 2 – Sep 29 · Ogham: ᚋ Muin

Vine is the tree of harvest — born at the balance point where summer and autumn meet. Those born under Vine are refined, perceptive, and deeply attuned to beauty, balance, and the subtleties others walk past without noticing.

## Personality

### Strengths
- Refined taste and sharp aesthetic sensibility
- Deeply empathetic and emotionally perceptive
- Elegant in manner, appearance, and expression
- Discerning — sees quality where others see quantity
- Indulgent in the best sense — savors life fully
- Balanced and fair-minded in judgment

### Watch Out For
- Indecision when multiple equally beautiful paths appear
- Changeable moods that shift without clear cause
- Melancholy that sets in when the world falls short of beauty
- People-pleasing to avoid necessary conflict
- Overindulgence in pleasure at the cost of progress

## Relationships

### Thrives When
- Surrounded by beauty, comfort, and sensory richness
- Partnered with someone refined and emotionally aware
- Given romance, elegance, and genuine tenderness
- Harmony is the baseline, not something to be fought for
- Feeling genuinely seen and savored — not just needed

### Watch Out For
- Avoiding difficult conversations to preserve surface peace
- Allowing indecision to leave partners without clarity
- Letting melancholy pull you away from connection
- Choosing aesthetics over genuine compatibility
- Dependency on a partner to stabilize shifting inner states

## Money & Finance

### Attracts Prosperity By
- Building wealth through taste, curation, and discernment
- Investing in beauty, culture, art, and luxury markets
- Using emotional intelligence to read people and opportunities
- Creating income around hospitality, experience, and refinement
- Balancing indulgence with genuine long-term financial strategy

### Watch Out For
- Lifestyle spending that exceeds income out of aesthetic necessity
- Indecision about investments that costs real opportunity
- Emotional state heavily influencing financial decisions
- Undervaluing your own taste and curatorial skill
- Avoidance of financial conflict or uncomfortable money conversations

## Career

### Advances By
- Working in fields where taste and discernment are rare assets
- Building environments of beauty and excellence
- Using emotional intelligence in leadership and client relationships
- Creating experiences, products, and services of genuine refinement
- Collaborating with those whose precision complements your vision

### Watch Out For
- Environments of coarseness, low standards, or aesthetic indifference
- Roles that require constant conflict and confrontation
- Indecision in roles that demand decisive leadership
- Allowing others to define your value for you

### Best Career Fields
- Wine, food, and hospitality
- Interior design and visual arts
- Fashion and luxury brand development
- Event planning and curation
- Music and performance
- Counseling and emotional coaching
- Beauty and aesthetics industries

## Sign Relationships

### Deepest Bond
- **Hazel** (Aug 5 – Sep 1) — Two discerning, quality-focused minds who build an aesthetic and intellectual life of genuine refinement together
- **Birch** (Dec 24 – Jan 20) — Vine's grace and balance tempers Birch's drive into something truly accomplished and beautiful

### Natural Allies
- **Holly** (Jul 8 – Aug 4) — Vine's elegance naturally harmonizes with Holly's commanding presence; a regal and satisfying match
- **Willow** (Apr 15 – May 12) — Both emotionally attuned; a sensitive, beautiful, and deeply feeling bond

### Challenging Pairs
- **Ash** (Feb 18 – Mar 17) — Both moody; when neither is anchored they drift together in circles without building anything
- **Reed** (Oct 28 – Nov 24) — Reed's relentless intensity can overwhelm Vine's core need for balance, beauty, and peace`,

  Ivy: `# Ivy — The Survivor
### Sep 30 – Oct 27 · Ogham: ᚌ Gort

Ivy grows through obstacles, clings to walls, and thrives where nothing else can. Those born under Ivy are tenacious survivors — compassionate, fiercely loyal, and possessed of a quiet inner strength that reveals itself most powerfully under pressure.

## Personality

### Strengths
- Remarkable resilience — recovers from what would break others
- Deeply compassionate and giving
- Sharp intellect combined with genuine warmth
- Loyal to a depth that is rare and unwavering
- Charismatic in an understated, magnetic way
- Able to find light in the darkest circumstances

### Watch Out For
- Overgiving to others while neglecting yourself
- Restlessness when life feels too settled or routine
- Difficulty making firm decisions when loyalty conflicts with logic
- Absorbing others' pain at the cost of your own stability
- Saying yes when you mean no to avoid disappointing anyone

## Relationships

### Thrives When
- Loved with the same intensity and loyalty offered in return
- Partnered with someone emotionally generous and consistent
- Building a relationship rooted in genuine mutual support
- Given space to breathe while still feeling deeply connected
- Feeling that your giving is recognized, not taken for granted

### Watch Out For
- Attracting partners who take without reciprocating
- Staying in relationships long past when they have ended
- Overextending emotional support until resentment builds
- Indecision about the relationship masked as compassion
- Putting a partner's needs so far above yours that you disappear

## Money & Finance

### Attracts Prosperity By
- Building wealth through service, care, and community trust
- Investing in social enterprises and ethical businesses
- Using sharp intelligence to identify overlooked opportunities
- Collaborating with others in financially aligned partnerships
- Turning compassion and connection into professional capital

### Watch Out For
- Financial generosity that leaves you vulnerable
- Difficulty charging what your time and care are worth
- Lending money emotionally rather than strategically
- Indecision about financial moves that require courage
- Supporting others financially before your own stability is secured

## Career

### Advances By
- Building careers rooted in service and genuine human impact
- Using resilience as a professional superpower
- Inspiring teams through warmth, loyalty, and tenacity
- Creating systems of support that outlast your direct involvement
- Turning personal experience of survival into meaningful work

### Watch Out For
- Environments that exploit compassion without reciprocation
- Roles where personal sacrifice is normalized and expected
- Burnout from constant giving without institutional support
- Difficulty asserting leadership out of over-deference to others

### Best Career Fields
- Healthcare and social work
- Counseling, therapy, and coaching
- Non-profit and community organizing
- Education and early childhood development
- Human resources and organizational culture
- Writing and storytelling
- Animal care and environmental protection

## Sign Relationships

### Deepest Bond
- **Birch** (Dec 24 – Jan 20) — Ivy's heart combined with Birch's drive creates an unshakeable, deeply devoted partnership built to last
- **Willow** (Apr 15 – May 12) — Both loyal and emotionally deep; they hold space for each other through everything without question

### Natural Allies
- **Rowan** (Jan 21 – Feb 17) — Rowan's mind and Ivy's heart form a connection that is both intellectually and emotionally nourishing
- **Oak** (Jun 10 – Jul 7) — Two deeply caring souls who build an enduring life of genuine mutual support and loyalty

### Challenging Pairs
- **Alder** (Mar 18 – Apr 14) — Alder's drive for independence conflicts with Ivy's deep need for consistent presence
- **Reed** (Oct 28 – Nov 24) — Reed's probing emotional intensity can gradually exhaust Ivy's generous and giving nature`,

  Reed: `# Reed — The Inquisitor
### Oct 28 – Nov 24 · Ogham: ᚍ Ngetal

Reed grows in deep water and bends without breaking — a conduit between worlds. Those born under Reed are driven by purpose, fearless in pursuit of truth, and capable of navigating complexity that stops others in their tracks.

## Personality

### Strengths
- Fearless in the pursuit of truth and deeper meaning
- Highly determined — pursues goals with singular intensity
- Complex thinker who sees layers others miss entirely
- Natural investigator and uncoverer of hidden things
- Deeply purposeful — driven by meaning, not just ambition
- Resilient in the face of transformation and upheaval

### Watch Out For
- Manipulative tendencies when the end justifies the means
- Opportunism that crosses ethical lines
- Destructive behavior during periods of intense frustration
- Becoming obsessive about a goal or a person
- Using intensity as control rather than connection

## Relationships

### Thrives When
- Partnered with someone who can match their depth
- Given complete loyalty and emotional authenticity
- Sharing a sense of purpose and mutual transformation
- Allowed to lead while also trusting a partner fully
- Feeling the relationship is built on truth, not performance

### Watch Out For
- Intensity that overwhelms partners who need lightness
- Jealousy or possessiveness when trust feels fragile
- Testing a partner's loyalty through manipulation
- Emotional secrecy that leaves partners feeling shut out
- Destroying what is good in the search for what is deeper

## Money & Finance

### Attracts Prosperity By
- Pursuing income tied to mastery and investigative skill
- Investing with deep research rather than trend-following
- Building wealth through transformative ventures
- Identifying undervalued assets others overlook
- Using determination and fearlessness in negotiation

### Watch Out For
- High-risk financial decisions made in obsessive pursuit
- Financial secrecy that creates problems in partnerships
- All-or-nothing thinking that damages financial stability
- Using money as a means of control in relationships
- Ignoring long-term planning when focused on an immediate goal

## Career

### Advances By
- Working in fields that reward depth, research, and courage
- Investigating what others are afraid to examine
- Building expertise in complex, high-stakes environments
- Using purpose-driven intensity as a professional force
- Creating lasting change through relentless focused effort

### Watch Out For
- Environments that demand surface-level engagement
- Work that lacks meaning or real-world consequence
- Roles that require hiding your perceptiveness to fit in
- Burnout from the intensity of singular focus

### Best Career Fields
- Investigative journalism and documentary work
- Psychology, psychiatry, and deep therapy
- Research and forensic science
- Law, prosecution, and criminal justice
- Intelligence and security services
- Surgery and emergency medicine
- Philosophy and religious studies

## Sign Relationships

### Deepest Bond
- **Oak** (Jun 10 – Jul 7) — Oak's protective stability gives Reed's intensity somewhere safe and purposeful to root and grow
- **Hazel** (Aug 5 – Sep 1) — Two precision-driven truth-seekers; their combined intelligence and depth can penetrate any mystery

### Natural Allies
- **Ash** (Feb 18 – Mar 17) — Ash's dreamlike imagination combined with Reed's depth creates a profoundly transformative bond
- **Elder** (Nov 25 – Dec 23) — Both are driven by a need to uncover what is hidden; a rare meeting of minds built on mutual respect for truth

### Challenging Pairs
- **Vine** (Sep 2 – Sep 29) — Vine's preference for surface beauty and harmony frustrates Reed's relentless need to go deeper
- **Rowan** (Jan 21 – Feb 17) — Philosophical friction; both are entirely certain their worldview is the correct one`,

  Elder: `# Elder — The Seeker
### Nov 25 – Dec 23 · Ogham: ᚏ Ruis

Elder is the last tree of the Celtic year — wild, ancient, and deeply mysterious. Those born under Elder are freedom-loving seekers with an untameable spirit. Often misunderstood, they carry uncommon depth and a restless need to discover what lies beyond the next horizon.

## Personality

### Strengths
- Deeply thoughtful beneath an outward wildness
- Freedom-loving and genuinely original in perspective
- Outspoken and honest to a degree others rarely achieve
- Philosophical — drawn to life's biggest questions
- Fiercely independent and self-sufficient
- Generous with wisdom earned through real experience

### Watch Out For
- Recklessness when freedom feels threatened
- Self-destructive patterns during periods of disillusionment
- Difficulty committing to anything that feels like a cage
- Speaking truth without enough care for timing or impact
- Restlessness that prevents the harvest of what was planted

## Relationships

### Thrives When
- Partnered with someone who needs no anchoring or taming
- Given genuine freedom within love, not just the promise of it
- Sharing philosophical conversation and real adventure
- Loved deeply without the expectation of conformity
- Allowed to love intensely on their own terms and timeline

### Watch Out For
- Running from depth when it starts to feel like limitation
- Using freedom as an excuse to avoid real intimacy
- Choosing adventure over nurturing what has already grown
- Explosive honesty that damages without intention to heal
- Disappearing emotionally when life demands consistency

## Money & Finance

### Attracts Prosperity By
- Building income that travels with you and requires no fixed location
- Investing in experiences, knowledge, and expanding worldview
- Turning philosophical depth and wide experience into value
- Creating income through writing, speaking, and exploration
- Making unconventional financial choices that ultimately pay off

### Watch Out For
- Reckless financial decisions made in pursuit of the next adventure
- Ignoring foundational financial planning as too constraining
- Carelessness with money during periods of restlessness
- Spending on freedom now at the cost of security later
- Burning financial bridges in the pursuit of change

## Career

### Advances By
- Pursuing work that demands and rewards independent thought
- Building a career path that evolves with genuine experience
- Turning wide-ranging curiosity into cross-disciplinary expertise
- Writing, traveling, teaching, and speaking from lived experience
- Inspiring others with perspectives forged in the wilderness of experience

### Watch Out For
- Roles that require surrender of core independence
- Environments built on conformity, routine, and small thinking
- Commitments made in a different state of mind that now feel binding
- Leaving careers prematurely just before breakthrough

### Best Career Fields
- Travel writing, journalism, and exploration
- Philosophy and theology
- Film, documentary, and storytelling
- Teaching at advanced or self-directed levels
- Environmental science and wilderness work
- Motivational speaking and life coaching
- Music, poetry, and creative arts

## Sign Relationships

### Deepest Bond
- **Alder** (Mar 18 – Apr 14) — Two pioneers who live fully and bravely; an expansive, electric connection built entirely on shared adventure
- **Holly** (Jul 8 – Aug 4) — Both sovereign and wild in their own way; an intensely magnetic and transformative bond

### Natural Allies
- **Rowan** (Jan 21 – Feb 17) — Two philosophical free thinkers who completely respect each other's need for independence
- **Reed** (Oct 28 – Nov 24) — Both driven to uncover what is hidden and understand what is true; a rare and deeply purposeful meeting of minds

### Challenging Pairs
- **Hazel** (Aug 5 – Sep 1) — Elder's chaos and resistance to structure conflicts deeply with Hazel's need for order and precision
- **Birch** (Dec 24 – Jan 20) — Elder's absolute need for freedom and Birch's drive for structured achievement are fundamentally at odds`,
};

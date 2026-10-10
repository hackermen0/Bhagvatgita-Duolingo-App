// Philosophy mode, Chapter 1: the story before the Gita (played once, as the chapter's first node) and the
// verses BG 1.1–1.5. Transcribed from the philosophy doc. Inline text may use **bold** and *italic*.
//
// Added here, not in the doc: the Devanagari of each verse (so the voice can read the Sanskrit and Hard can
// show it) and the title of 1.1. Review both, as with the rest of the content.

import type { PhilosophyVerse, StoryPage } from './philosophy';

const VERSE_1_1 = {
  roman: 'dharmakṣetre kurukṣetre samavetā yuyutsavaḥ\nmāmakāḥ pāṇḍavāś caiva kim akurvata sañjaya',
  dev: 'धर्मक्षेत्रे कुरुक्षेत्रे समवेता युयुत्सवः।\nमामकाः पाण्डवाश्चैव किमकुर्वत सञ्जय॥'
};

// ─── The story before the Gita ──────────────────────────────────────────────

export const PRELUDE_PAGES: StoryPage[] = [
  {
    kicker: 'Opening',
    title: 'A Question From the Dark',
    sections: [
      {
        paragraphs: [
          `The Bhagavad Gita is one of the most loved books in human history. Gandhi carried it. Thoreau and Emerson read it at Walden. And it opens in the strangest way.`,
          `A blind king sits in his palace, far from a battlefield, and asks his assistant one nervous question: "What are my sons doing out there, and what are my brother's sons doing?"`,
          `That's it. That is the first line.`,
          `Think about the last time you sat in a hospital waiting room, or by your phone waiting for a text from a kid who was late getting home. You weren't there. You couldn't see. You just needed someone to tell you what was happening. That is where this king is sitting.`,
          `Here is the twist. The two armies on that battlefield are one family. Cousins. Uncles. Grandfather. Teachers. And the fight that brought them there started at home, decades earlier, long before anyone picked up a sword. It grew out of jealousy, favoritism, a parent who couldn't say no, and good people who stayed quiet when they should have spoken up.`,
          `In other words, it is a family story. Every family will recognise some piece of it.`,
          `So before we open the first verse, let me tell you how this family fell apart.`
        ]
      }
    ]
  },
  {
    kicker: 'Part 1',
    title: 'The Promise That Lasted Too Long',
    sections: [
      {
        heading: 'The story',
        tone: 'story',
        paragraphs: [
          `Generations before the war, a young prince named Devavrata was heir to the kingdom of Hastinapura. Then his widowed father, the king, fell in love with a fisherman's daughter. Her father had one condition: only her children could ever inherit the throne.`,
          `The son saw how miserable his dad was and fixed it himself. He gave up the crown. And to settle any doubt about future heirs, he swore he would never marry and never have children. He would spend his entire life protecting the throne of Hastinapura.`,
          `From that day he was called Bhishma, "the one of the terrible vow." He became the family's patriarch, its greatest warrior, the grandfather figure everyone respected.`,
          `Keep him in mind. His promise matters later.`
        ]
      },
      {
        heading: 'The modern mirror',
        tone: 'mirror',
        paragraphs: [
          `You probably know a Bhishma. Think of the man who has worked at the same family-owned company for thirty-five years. He promised the founder he would always take care of the business. Everyone trusts him. He knows where every file is.`,
          `The founder retires. The founder's son takes over, and the son is reckless. Slowly, without ever deciding to, the loyal employee's promise shifts. Protecting the company turns into protecting whoever sits in the corner office. When the new boss does something clearly wrong, he stays quiet, because loyalty is who he is.`,
          `That is the quiet danger in Bhishma's story. A promise made out of love can, over time, end up serving the very people it was meant to protect against.`
        ]
      }
    ]
  },
  {
    kicker: 'Part 2',
    title: 'The Brother Who Was Passed Over',
    sections: [
      {
        heading: 'The story',
        tone: 'story',
        paragraphs: [
          `Two half-brothers were born into the royal family. The older one, Dhritarashtra, was born blind. The younger one, Pandu, could see.`,
          `By birth, the older brother should have been king. But the elders ruled that a king had to see his people, inspect his army and ride into battle. So the crown went to the younger brother.`,
          `Later, Pandu stepped away from the throne and went to live in the forest with his two wives. Someone had to run the kingdom, so the blind older brother finally sat on the throne. Only as a stand-in, though. Everyone understood the crown still belonged to Pandu's family line.`,
          `Pandu had five sons in the forest: the Pandavas. When Pandu died, their mother brought the five boys back to the palace. And the oldest of them, Yudhishthira, was now the rightful heir.`,
          `Imagine being Dhritarashtra. You are the eldest. You are sitting in the big chair. You have a son of your own. And everyone is politely waiting for your nephew to grow up and take it from you.`,
          `His name, by the way, means "the one who holds on to the kingdom."`
        ]
      },
      {
        heading: 'The modern mirror',
        tone: 'mirror',
        paragraphs: [
          `Picture two siblings and a family business, say a hardware store or a car dealership their dad built. The oldest expected to take it over. Dad hands it to the younger one instead. Later the younger sibling moves away, and the older one is asked to "keep things running" until the younger sibling's kid is old enough to step in.`,
          `Or picture yourself as the "acting manager" at work for years, doing the job, while everyone knows the official title is reserved for someone else.`,
          `You can do that job well and still feel the sting every single day. And here is the part that matters most: that sting rarely stays with one person. It shows up at Thanksgiving. It leaks into how you talk about your relatives in front of your kids. Children absorb a parent's grudges long before they understand them.`
        ]
      }
    ]
  },
  {
    kicker: 'Part 3',
    title: 'Raising Duryodhana',
    sections: [
      {
        heading: 'The story',
        tone: 'story',
        paragraphs: [
          `Dhritarashtra married a princess named Gandhari. When she found out her husband was blind, she tied a blindfold over her own eyes and wore it for the rest of her life. It is remembered as an act of devotion. It also meant that in a home that badly needed one parent who could see, both chose not to.`,
          `She brought along her brother, Shakuni: smart, bitter and always whispering.`,
          `Their first son was Duryodhana. When he was born, there were terrible omens, and the wisest man in the court, Vidura, told the king straight out: this child will bring ruin to the whole family. Let him go.`,
          `The father refused. He loved his son too much. In India this has a name: **putra moha**, the kind of love for your child that makes you blind to what your child is actually doing.`,
          `Duryodhana grew up resenting his five cousins. As teenagers, he poisoned his cousin Bhima's food and threw him into a river. Later he built a house out of lac, a material that burns like paper, sent the five cousins and their mother to live in it, and planned to set it on fire while they slept. They escaped through a tunnel.`,
          `And Dad? He looked uncomfortable. He said a few words. Nothing happened. Duryodhana learned the most important lesson of his childhood: no matter what I do, my father will cover for me.`,
          `To be fair, Duryodhana was also brave, talented and fiercely loyal. When a young man named Karna was humiliated in public for his low birth, Duryodhana defended him and made him a king on the spot. Karna stayed loyal to him until death.`
        ]
      },
      {
        heading: 'The modern mirror',
        tone: 'mirror',
        paragraphs: [
          `You have seen this parent at the field on Saturday morning.`,
          `Their kid shoves another player, and they yell at the ref. Their kid gets benched for skipping practice, and they email the coach and the athletic director by Monday. Their kid cheats on a test, and they are in the principal's office explaining why it was the teacher's fault. Every consequence gets negotiated away.`,
          `That parent believes this is love. And there usually is love in it. But watch what the kid learns: rules are for other people, and someone will always clean up after me.`,
          `Gandhari is the other parent in that household, the one who sees enough to worry and decides it is easier not to look. And Shakuni is the uncle, the friend, or the group chat that keeps telling the kid, "The coach is playing favorites. Those other kids don't deserve what they have. You do."`,
          `None of this excuses Duryodhana. He became an adult who made his own choices. But it explains him. And it is a warning to every one of us who loves a child: the most loving word a parent can say is sometimes "No. You did this. You have to face it."`
        ]
      }
    ]
  },
  {
    kicker: 'Part 4',
    title: 'The Game of Dice',
    sections: [
      {
        heading: 'The story',
        tone: 'story',
        paragraphs: [
          `The five cousins survived the fire. The middle brother, Arjuna, won the hand of a brilliant princess named Draupadi in an archery contest, and she became the wife of all five brothers. To keep the peace, the blind king split the kingdom and gave the five brothers a stretch of wild, barren forest. They turned it into a gorgeous city. The eldest, Yudhishthira, was crowned emperor.`,
          `Duryodhana visited their new palace, slipped into a pool he thought was a polished floor, and heard people laughing. He went home humiliated and furious.`,
          `Poison had failed. Fire had failed. So Uncle Shakuni suggested something friendlier: invite the cousins over for a game of dice. Shakuni was the best player alive, and everybody knew Yudhishthira loved the game and played it badly.`,
          `Yudhishthira was the most honest man in the kingdom. His wise uncle Vidura warned him it was a setup. He went anyway, saying a king can't turn down a challenge.`,
          `He bet his jewels and lost. His gold. His chariots. His army. Then the kingdom the brothers had built from scratch. Lost, every time.`,
          `Then he bet his brothers, one by one. Lost. He bet himself, and became a slave. And then Shakuni said, "You still have one thing left."`,
          `Yudhishthira bet his wife, Draupadi.`,
          `He lost her too.`,
          { pause: true },
          `And his four brothers, including Bhima, the strongest man in the room, sat there and said nothing, because their big brother was in charge.`
        ]
      },
      {
        heading: 'The modern mirror',
        tone: 'mirror',
        paragraphs: [
          `It is 1 a.m. Someone you love is on the sofa with a sports betting app. Down $200. "I'll just place one more to win it back." Down $800. "Okay, a bigger parlay, then I'm done." Down the mortgage payment. Down the college fund.`,
          `Or it is a stock tip, or a crypto coin, or a weekend in Vegas that was supposed to be just for fun.`,
          `What makes Yudhishthira's fall so painful is that he was the good one. That is exactly the trap. Good, responsible people often assume their judgment will protect them. Pride says, "I'm not the kind of person who loses everything." And hope says, "One more throw fixes it."`,
          `The lesson is simple and hard: know your limit, and stand up from the table before you reach it. And if someone in your family is losing control, being "respectful" and staying silent, like those four brothers, may be the least loving thing you can do.`
        ]
      }
    ]
  },
  {
    kicker: 'Part 5',
    title: 'The Room Where Everyone Stayed Silent',
    sections: [
      {
        heading: 'The story',
        tone: 'story',
        paragraphs: [
          `Duryodhana sent a servant to bring Draupadi to the court, like property he now owned.`,
          `She refused, and sent back a question that no one could answer: "When my husband bet me, had he already lost himself? If he was already a slave, how could he bet anyone?" A man who no longer owns himself can't gamble away his wife. It was a brilliant point.`,
          `Duryodhana answered it with force. His brother Dushasana dragged her into the royal court by her hair, in front of every king, elder and teacher in the land.`,
          `She turned to the most respected man in the room, the grandfather Bhishma, and asked him directly whether this was legal. He said the question of what is right was "subtle," and he could not decide.`,
          `Karna then argued that since Yudhishthira had lost everything, his wife belonged to the winners too, and he told Dushasana to strip her in front of everyone.`,
          `Only one person objected: Vikarna, one of Duryodhana's own younger brothers. He was shouted down.`,
          `Dushasana began pulling at her sari. Her husbands sat with their heads down. The elders looked away. With no one left to turn to, Draupadi raised her arms and prayed to Krishna. And the cloth kept coming, yard after yard, until Dushasana collapsed in exhaustion and she was still covered.`
        ]
      },
      {
        heading: 'The modern mirror',
        tone: 'mirror',
        paragraphs: [
          `Most of us will never see anything like that hall. But almost all of us have sat in a smaller version of it.`,
          `The school board meeting where a parent raises a real problem about a coach, and every adult at the table suddenly finds a procedural reason to table it. The office where everybody knows a powerful manager treats one woman horribly, and the senior VP says, "It's complicated, there's a process." The family group chat where an uncle says something cruel about someone, and everyone just sends nothing.`,
          `Bhishma was a genuinely good man. That is the frightening part. He had served this family for decades. His loyalty to the institution, and to the people currently running it, had become so strong that it outweighed the human being standing in front of him.`,
          `When a rule, a tradition or a loyalty asks you to stay silent while someone is being humiliated, that is the moment it has stopped deserving your loyalty. Vikarna was the youngest and least powerful person in the room, and he was the only one who got it right. Sometimes you will be the only Vikarna. Speak anyway.`
        ]
      }
    ]
  },
  {
    kicker: 'Part 6',
    title: 'Making It Go Away, and Going Back for More',
    sections: [
      {
        heading: 'The story',
        tone: 'story',
        paragraphs: [
          `Bhima, the strong brother, finally stood up and swore before the whole court that one day he would break Duryodhana's thigh and make Dushasana pay with his blood. Draupadi left her hair loose, and in the version most Indians grew up with, she vowed never to tie it again until that wrong was avenged.`,
          `Then frightening omens filled the palace. Jackals howled inside the sacred fire room. The blind king panicked. He was afraid of what a wronged, righteous woman's curse might do to his sons.`,
          `So he changed his tone completely. He spoke kindly to Draupadi and offered her wishes. With the first, she freed Yudhishthira. With the second, she freed the other four brothers. Offered a third, she declined. She had freed her whole family herself.`,
          `The king gave the Pandavas back everything they had lost and asked them to please forget about today and go home.`,
          `Notice what he left out. Duryodhana got no punishment. Dushasana got no punishment. No one apologized to Draupadi.`,
          `Then, before the Pandavas were even home, Duryodhana ran to his father: "If you let them leave, they'll come back with an army. Call them back for one more game." And the father said yes, again.`,
          `One stake this time: the loser spends twelve years in exile in the forest, plus a thirteenth year in hiding. If they're recognized that last year, they start over.`,
          `And Yudhishthira, a few hours after watching his wife be dragged across that floor, sat down at the same table. And lost.`,
          `That second game is what sent them into exile. The first loss was undone by Draupadi's courage. The second one was a choice.`
        ]
      },
      {
        heading: 'The modern mirror',
        tone: 'mirror',
        paragraphs: [
          `The king's move is painfully familiar. A powerful dad's teenage son assaults someone at a party. Dad calls a lawyer, writes a check, talks about "protecting his future," and asks the victim's family to "let everyone move on." The victim gets something that looks like generosity. The son gets nothing at all, and learns once again that money and influence make problems disappear.`,
          `That is putra moha with a checkbook.`,
          `And Yudhishthira's second game? That is the relapse. The person who swears off the casino and goes back the next weekend. The friend who leaves the toxic boyfriend and is back with him in a month. The "I'll just check the app once." Falling once is human. Walking straight back to the thing that just broke you is the moment to stop and ask for help.`
        ]
      }
    ]
  },
  {
    kicker: 'Part 7',
    title: "The Report Card He Wouldn't Open",
    sections: [
      {
        heading: 'The story',
        tone: 'story',
        paragraphs: [
          `Thirteen years passed. The Pandavas kept every day of the deal: twelve years in the forest, and a thirteenth year working undercover as servants in another king's palace. Then they came home and asked for their kingdom back.`,
          `Duryodhana said no.`,
          `The Pandavas didn't want to fight their own grandfather and teachers. So their cousin Krishna went to the palace as a peace negotiator and made the smallest possible ask. Forget the kingdom. Give the five brothers five villages, one each, and there will be no war.`,
          `Duryodhana's answer became famous: "I won't give them enough land to fit on the point of a needle."`,
          `War became certain. Eighteen armies gathered on a plain called Kurukshetra.`,
          `The night before the battle, the sage Vyasa came to see the blind king. Vyasa was the wise author of this whole story, and also the king's own biological father. He spoke bluntly: "Your sons are marching to their deaths. If you want to stop this, stop it now."`,
          `The king's reply is one of the most honest things anyone says in the entire epic: "I know. I see it as clearly as you do. But I'm like everyone else. When self-interest comes in, good sense goes out. And my sons don't listen to me."`,
          `Then Vyasa offered him a gift: divine sight. After a lifetime of blindness, he could finally see, and watch the whole war with his own eyes.`,
          `The king said no.`,
          `He said he couldn't bear to watch his family being killed, but he'd like someone to tell him about it.`
        ]
      },
      {
        heading: 'Why he said no',
        tone: 'story',
        paragraphs: [
          `Many readers believe there's more under that answer. Deep down he knew his sons were in the wrong and that the battlefield was sacred ground where wrong rarely wins. He still wanted them to win. He wanted the kingdom. He just couldn't stand to look directly at what it would cost. So he chose a filter: let someone else watch, and just tell me.`
        ]
      },
      {
        heading: 'The modern mirror',
        tone: 'mirror',
        paragraphs: [
          `Think of the parent who leaves the report card sealed on the kitchen counter for a week. Or the one who won't watch the game film, because the film would show their kid isn't the star they keep telling everyone about. Or the person who skips the doctor's follow-up appointment because "I'd rather not know."`,
          `We all do a small version of this. We want the good outcome, and we avoid the information that might tell us we're wrong. The king's line says it perfectly: when self-interest comes in, good sense goes out.`
        ]
      },
      {
        heading: 'The one who could see',
        tone: 'story',
        paragraphs: [
          `So the divine sight went to Sanjaya, the king's assistant and driver. Sanjaya was honest, had warned the king many times, wanted nothing from the war, and loved his boss without flattering him.`,
          `Everyone needs a Sanjaya. The friend who will tell you the truth about your marriage, your drinking, your kid, your business plan, kindly and without an agenda. If you have one, keep them close. If you don't, be one for someone.`
        ]
      }
    ]
  },
  {
    kicker: 'The Gita begins',
    title: 'Start of the Gita',
    sections: [
      {
        paragraphs: [
          `Now we can finally open the Gita. Here is the very first line, spoken by the blind king to Sanjaya:`,
          { sanskrit: VERSE_1_1.roman, dev: VERSE_1_1.dev },
          `"On the sacred field of Kurukshetra, gathered and eager to fight, what did my sons and the sons of Pandu do, Sanjaya?"`,
          `Listen to that phrase: *my sons* and *the sons of Pandu*. They grew up in the same house. They are his nephews. And even now, at the very end, he still divides the family into "mine" and "theirs." That one word, *māmakāḥ*, "mine," is the whole tragedy in miniature.`,
          `Out on the field, the hero of the Pandavas, Arjuna, asks Krishna to drive his chariot into the space between the two armies so he can take a look. He sees his grandfather, who used to carry him on his shoulders. His teacher, who taught him everything he knows. His cousins. His uncles.`,
          `His hands shake. His bow slips out of his hands. He sits down in the chariot and says, "I can't do this. I won't fight."`,
          `The rest of the Bhagavad Gita is Krishna's answer to that moment.`
        ]
      },
      {
        heading: 'The modern mirror',
        tone: 'mirror',
        paragraphs: [
          `You may never stand on a battlefield. But almost every adult eventually reaches Arjuna's moment.`,
          `It's the night before the family intervention for a brother who is drinking himself to death. It's deciding whether to report a beloved coach after your daughter tells you what really happens at practice. It's setting a hard boundary with a parent who has hurt you for years. It's the moment you know what is right, and the people standing on the other side are people you love.`,
          `And the voice in your head says what Arjuna said: "Maybe it's not worth it. Maybe I should just keep the peace."`,
          `Krishna's answer, across 700 verses, is a guide to exactly that moment. How to do the right thing without hatred. How to act without being paralyzed by fear of the outcome. How to stay steady when your heart is breaking. How to tell real compassion apart from simply avoiding a hard conversation.`
        ]
      },
      {
        heading: 'One last detail',
        tone: 'story',
        paragraphs: [
          { pause: true },
          `The Gita opens with the blind king saying "mine." Seven hundred verses later, it closes with Sanjaya, the man who could truly see, saying that wherever Krishna and Arjuna stand, there will be victory and goodness. And the very last word of that final verse is *mama*. "Mine." As in, "This is my conviction."`,
          `It begins with the "mine" of a man clinging to what he owns, and ends with the "mine" of someone who has seen clearly and knows what he believes.`,
          `The whole Gita is the road between those two words. Let's begin.`
        ]
      }
    ]
  }
];

// ─── Verses 1.1–1.5 ─────────────────────────────────────────────────────────

export const CHAPTER_1_VERSES: PhilosophyVerse[] = [
  {
    id: 'ph_bg1_1',
    verseRef: 'BG 1.1',
    title: "The Blind King's Question",
    sanskrit: VERSE_1_1,
    english: `Dhritarashtra said: "O Sanjaya, on the field of righteousness, the field of the Kurus, gathered together and eager to fight, what did my sons and the sons of Pandu do?"`,
    sections: [
      {
        heading: 'A question whose answer he already fears.',
        text: `Two armies gathered to fight. What else would they do? A man at peace would not need to ask. And the epic tells us when he asks it: ten days into the war, right after Sanjaya brings news that Bhishma, the grandfather he was counting on, has fallen. Dhritarashtra is asking for the story from the beginning because he already senses the ending. Anxiety is often the shadow cast by a truth we have refused to look at.`
      },
      {
        heading: 'Why "my sons" and "the sons of Pandu"?',
        text: `These boys grew up under one roof. He raised the Pandavas after their father died. And still, in his very first sentence, he draws a line through the family: mine on one side, theirs on the other.\nTo understand that line, remember his wound. He was the elder brother, passed over for the throne because he was blind. Even when he finally sat on it, he sat as a caretaker for his brother's line. The crown was never fully his. The one thing in the world that was undeniably his own was his children. So his sons stopped being simply people he loved. They became his compensation for everything life had taken from him, extensions of his own ego. Love of that kind looks like devotion, but at its core it is a form of self-love.\nThis is the deepest root of division in any family, company or nation: the moment we decide where "mine" ends. Everything inside that line gets our protection and excuses. Everything outside it becomes a rival. The battlefield is simply that inner line made visible with armies.`
      },
      {
        heading: 'Why call it the field of righteousness?',
        text: `Before any hero or god appears, the Gita names the ground: a field where actions will be weighed. The king's fear is precisely this. He knows his sons are in the wrong, and on such ground, wrong cannot hide behind numbers or power. Symbolically, every human life is this field. No one steps outside the consequences of what they do.`
      },
      {
        heading: 'Why ask Sanjaya instead of seeing?',
        text: `Because he refused to see. When the sage Vyasa offered him divine sight, he declined, and the gift went to Sanjaya. So the man who held the most power in this story now holds the least knowledge. He wanted the outcome, but he did not want to witness the cost. Many of us live this way: we prefer the truth reported, softened by someone else's voice, rather than faced directly.`
      },
      {
        heading: 'The wrong question opens the right book.',
        text: `The Gita begins with a blind man's anxious question about who is winning. It goes on to answer a far deeper question that Arjuna will soon ask: how should I live and act when every choice hurts? The first question is about possession. The rest of the Gita is about freedom.`
      }
    ],
    questions: [
      {
        id: 'ph11_1',
        prompt: 'Why does the king call one side "my sons" and the other "the sons of Pandu"?',
        options: ['After losing the crown, his sons became the only thing truly "his"', 'The Pandavas were not related to him', 'It was royal custom to speak this way', 'He secretly preferred the Pandavas'],
        correct: 0,
        explanation: 'His wound turned his sons into an extension of his ego, so he drew a line through his own family.'
      },
      {
        id: 'ph11_2',
        prompt: 'Two armies gathered to fight. What does "What did they do?" really reveal?',
        options: ['Curiosity about battle tactics', 'A poor memory', 'A guilty mind dreading an answer it already suspects', "Concern for the soldiers' safety"],
        correct: 2,
        explanation: 'A man confident in his cause would not need to ask. His anxiety comes from what he refuses to admit.'
      },
      {
        id: 'ph11_3',
        prompt: 'Why does the Gita name the battlefield a "field of righteousness" before anything else?',
        options: ['It was the only open land nearby', 'To honor the Kuru dynasty', 'To declare the winner in advance', 'Because every action there will be morally weighed'],
        correct: 3,
        explanation: 'The setting itself announces that power and numbers cannot hide wrongdoing here.'
      },
      {
        id: 'ph11_4',
        prompt: 'By choosing to hear about the war instead of seeing it, what was the king really avoiding?',
        options: ['Danger to his own life', 'Facing the truth of his own choices', 'Boredom during a long war', 'The noise of battle'],
        correct: 1,
        explanation: 'He wanted the victory without witnessing its cost, so he kept the truth at a distance.'
      },
      {
        id: 'ph11_5',
        prompt: 'Where did this war truly begin?',
        options: ['In the dice hall', 'On the plain of Kurukshetra', "In the king's heart, when he split the family into mine and theirs", "At Krishna's failed peace talks"],
        correct: 2,
        explanation: 'The armies only made visible a division that had lived inside the king for decades.'
      }
    ]
  },
  {
    id: 'ph_bg1_2',
    verseRef: 'BG 1.2',
    title: 'The First Reaction',
    sanskrit: {
      roman: 'dṛṣṭvā tu pāṇḍavānīkaṁ vyūḍhaṁ duryodhanas tadā\nācāryam upasaṅgamya rājā vacanam abravīt',
      dev: 'दृष्ट्वा तु पाण्डवानीकं व्यूढं दुर्योधनस्तदा।\nआचार्यमुपसङ्गम्य राजा वचनमब्रवीत्॥'
    },
    english: `Sanjaya said: "But then, seeing the army of the Pandavas arranged for battle, King Duryodhana went to his teacher and spoke."`,
    sections: [
      {
        heading: 'How an honest witness speaks.',
        text: `The anxious father asked about his own sons first, so Sanjaya begins with Duryodhana. He meets the king where his heart is, and then tells him the truth anyway. This is the rarest skill in human relationships: compassion and honesty together. Flatterers give comfort without truth. Harsh critics give truth without care. Sanjaya gives both, and that is why he was trusted with divine sight.`
      },
      {
        heading: 'Seeing, then reacting.',
        text: `The verse turns on one movement: Duryodhana *saw*, and then he *went*. Perception came first, and an emotional reaction followed instantly, with no pause in between. Later in the Gita, Krishna describes this chain precisely: dwelling on what we see breeds attachment, attachment breeds desire, frustrated desire breeds anger, and anger clouds judgment. The whole Gita can be read as training for the space between seeing and reacting. Duryodhana has no such space.`
      },
      {
        heading: 'More soldiers, less peace.',
        text: `On paper, Duryodhana held the advantage: eleven armies against seven. Yet one look at a smaller, well-ordered force shook him. Outer power cannot settle an inner sense of wrongdoing. These were the cousins he poisoned, tried to burn alive, cheated at dice, and humiliated in public. When he looks at their army, he sees his own past standing in formation.`
      },
      {
        heading: 'Running for reassurance.',
        text: `The commander of his army was Bhishma. Duryodhana bypasses him and goes straight to his teacher, Drona. Why? Drona had taught both families and loved the Pandavas, especially Arjuna. An insecure mind looks for reassurance and tests the loyalty of the people around it. Leaders who feel secure in their cause inspire. Leaders who don't, check whether everyone is still on their side.`
      },
      {
        heading: 'A king who cannot rule himself.',
        text: `Sanjaya calls Duryodhana "the king." The title is real; the mastery is missing. The Gita will define true sovereignty as mastery over one's own mind and senses. By that measure, the calm minister in the palace, whose very name means "one who has conquered," is more of a king than the man wearing the crown.`
      }
    ],
    questions: [
      {
        id: 'ph12_1',
        prompt: "What is the first thing Duryodhana's mind does after seeing the Pandava army?",
        options: ['It calmly plans the battle', 'It turns to prayer', 'It celebrates certain victory', 'It reacts with unease and rushes for reassurance'],
        correct: 3,
        explanation: 'He sees, and he immediately reacts. There is no pause between perception and emotion.'
      },
      {
        id: 'ph12_2',
        prompt: 'Duryodhana had the larger army yet felt shaken. What does this teach?',
        options: ['Outer advantage cannot quiet an inner sense of wrongdoing', 'Larger armies always lose', 'Numbers never matter in war', 'He had miscounted his troops'],
        correct: 0,
        explanation: 'He knew what he had done to these cousins, and no army could silence that knowledge.'
      },
      {
        id: 'ph12_3',
        prompt: 'Sanjaya speaks first about the son the father is worried about. What does this model?',
        options: ['Always tell people what they want to hear', 'Speak the truth with compassion', 'Hide bad news for as long as possible', 'Answer only the exact question asked'],
        correct: 1,
        explanation: "He meets the king's heart first, then tells him the truth without softening it into a lie."
      },
      {
        id: 'ph12_4',
        prompt: 'Why does Duryodhana go to his teacher before his commander?',
        options: ['The teacher was standing closer', 'Out of respect for elders', 'Insecurity: he needed reassurance and wanted to test loyalty', 'The commander was not yet on the field'],
        correct: 2,
        explanation: 'Drona loved the Pandavas, and a frightened leader checks who is still truly on his side.'
      },
      {
        id: 'ph12_5',
        prompt: 'Sanjaya calls Duryodhana "the king." What is the quiet irony?',
        options: ['He holds the title but has no mastery over his own mind', 'He had never been crowned at all', 'Sanjaya was openly mocking him', 'He was a wiser ruler than Yudhishthira'],
        correct: 0,
        explanation: "In the Gita's view, real kingship is self-mastery, and the calm minister has more of it than the man with the crown."
      }
    ]
  },
  {
    id: 'ph_bg1_3',
    verseRef: 'BG 1.3',
    title: 'Weaponizing the Past',
    sanskrit: {
      roman: 'paśyaitāṁ pāṇḍu-putrāṇām ācārya mahatīṁ camūm\nvyūḍhāṁ drupada-putreṇa tava śiṣyeṇa dhīmatā',
      dev: 'पश्यैतां पाण्डुपुत्राणामाचार्य महतीं चमूम्।\nव्यूढां द्रुपदपुत्रेण तव शिष्येण धीमता॥'
    },
    english: `Duryodhana said: "Look, my teacher, at this mighty army of the sons of Pandu, arranged by the son of Drupada, your own brilliant student."`,
    sections: [
      {
        heading: "The son speaks in his father's voice.",
        text: `"The sons of Pandu." It is the exact phrase his father used a moment earlier. Duryodhana never says "my cousins," never says "my brothers." Children rarely inherit only a parent's wealth. They inherit the parent's grudges, the parent's fears, even the parent's sentences. Dhritarashtra never had to teach his son to divide the family. He simply spoke that way at home for twenty years.`
      },
      {
        heading: 'A circle of revenge.',
        text: `To feel the sting in "your brilliant student," you need the history. Drona and King Drupada were boyhood friends. When Drupada became king, he humiliated the poor Drona and denied their friendship. Drona later had his students defeat Drupada and seize half his kingdom. Drupada, burning with shame, performed a sacred fire ritual to obtain a son who would one day kill Drona. That son, Dhrishtadyumna, now commands the army in front of them.\nHumiliation, then counter-humiliation, then a child born specifically for revenge. This is how hatred reproduces itself across generations. Each side feels justified, and each act of payback becomes the next side's grievance. The Gita will teach the only real exit: to act from duty, without hatred and without craving for the fruits of revenge.`
      },
      {
        heading: 'The teacher who chose duty over safety.',
        text: `Here is the most astonishing detail. Knowing exactly why Dhrishtadyumna was born, Drona still accepted him as a student and taught him everything. A teacher's duty to share knowledge outweighed his own survival. Place this beside Dhritarashtra, who placed his own attachment above his duty as a king and a father. One man gives freely even to his destined killer. The other hoards a throne even from his own nephews.`
      },
      {
        heading: 'Manipulation as a sign of a weak cause.',
        text: `Duryodhana wraps an insult inside a compliment. He reminds his teacher of an old enemy, stirs his anger, and quietly calls him foolish for trusting that student. When a cause is strong, its leader appeals to what is right. When a cause is weak, its leader appeals to old wounds. It is the same method Shakuni used at the dice table: find the sore spot and press.`
      },
      {
        heading: 'Two kinds of blindness.',
        text: `The verse opens with a command: "Look!" Duryodhana cannot stop staring at what frightens him. His father, in the palace, refuses to look at all. One is blinded by obsession, the other by avoidance. Neither sees clearly. Sanjaya represents the third way the Gita teaches: to look at reality steadily, without running from it and without being swallowed by it.`
      }
    ],
    questions: [
      {
        id: 'ph13_1',
        prompt: 'Duryodhana repeats his father\'s phrase, "the sons of Pandu." What does that reveal?',
        options: ['Deep respect for Pandu', "Children inherit a parent's grudges, even their words", "He had forgotten his cousins' names", 'Formal battlefield etiquette'],
        correct: 1,
        explanation: 'The division he heard at home now comes out of his own mouth.'
      },
      {
        id: 'ph13_2',
        prompt: "Why does Duryodhana remind his teacher of Drupada's son?",
        options: ['To honor an old friendship', 'To share a fond memory', 'To praise a talented warrior', 'To stir old resentment instead of appealing to a just cause'],
        correct: 3,
        explanation: 'A weak cause borrows strength from old wounds.'
      },
      {
        id: 'ph13_3',
        prompt: 'Drona taught the very student who was born to kill him. What does this reveal?',
        options: ["A teacher's duty can rise above self-interest", "He never knew the boy's purpose", 'He was paid a fortune to do it', 'He secretly wanted to lose'],
        correct: 0,
        explanation: 'He chose his duty over his own safety, the opposite of what Dhritarashtra did.'
      },
      {
        id: 'ph13_4',
        prompt: 'Drupada and Drona humiliated each other in turn, and now face each other in war. What does this show?',
        options: ['Childhood friendships always last', 'Revenge eventually brings peace', 'Revenge breeds revenge until someone steps out of the cycle', 'Kings are incapable of forgiveness'],
        correct: 2,
        explanation: 'Each act of payback became the next grievance, and the Gita teaches action without hatred as the way out.'
      },
      {
        id: 'ph13_5',
        prompt: 'The father refuses to look; the son cannot stop staring. What links them?',
        options: ['Shared courage', 'Two forms of blindness: avoidance and obsession', 'A shared love of war', 'Trust in Sanjaya'],
        correct: 1,
        explanation: 'Neither sees reality steadily, which is exactly what Sanjaya, and the Gita, teach.'
      }
    ]
  },
  {
    id: 'ph_bg1_4',
    verseRef: 'BG 1.4',
    title: 'The Measuring Stick of Fear',
    sanskrit: {
      roman: 'atra śūrā maheṣvāsā bhīmārjuna-samā yudhi\nyuyudhāno virāṭaś ca drupadaś ca mahā-rathaḥ',
      dev: 'अत्र शूरा महेष्वासा भीमार्जुनसमा युधि।\nयुयुधानो विराटश्च द्रुपदश्च महारथः॥'
    },
    english: `"Here are heroes and mighty archers, equal in battle to Bhima and Arjuna: Yuyudhana, Virata, and Drupada, the great chariot-warrior."`,
    sections: [
      {
        heading: 'Fear becomes the ruler.',
        text: `Duryodhana measures every warrior on the other side against just two men: Bhima and Arjuna. Whatever we fear most quietly becomes the yardstick for everything else. He no longer sees warriors as they are. He sees them only through the shape of his own fear.`
      },
      {
        heading: 'The one we wronged is the one we fear.',
        text: `Notice the order: Bhima first, then Arjuna, though Arjuna was the greater archer. Thirteen years earlier, in the dice hall, Bhima stood before the whole court and swore to break Duryodhana's thigh. That vow has lived in Duryodhana's mind ever since. Guilt does this. The person we have wronged most deeply grows larger in our imagination than anyone else.`
      },
      {
        heading: 'A kept promise has witnesses.',
        text: `King Virata sheltered the Pandavas through their thirteenth year in disguise. When they returned, Duryodhana refused their kingdom, claiming they had been recognized before the year ended. Now Virata stands on the field, a living witness that the Pandavas kept every day of their word. Truth can be ignored for a while. Sooner or later it walks onto the field in human form.`
      },
      {
        heading: 'Earned loyalty and acquired loyalty.',
        text: `Before the war, Krishna offered a choice: his vast army, or himself alone and unarmed. Duryodhana chose the army. Arjuna chose Krishna. Yet Yuyudhana, also called Satyaki, a great warrior of Krishna's own clan, followed his heart to the Pandavas. Duryodhana collected resources. The Pandavas earned devotion. Symbolically, Duryodhana chose quantity over wisdom, and Arjuna chose the guide over the tools. Every one of us makes that choice in how we build a life.`
      },
      {
        heading: "One woman's dishonor moves a whole family.",
        text: `Drupada is Draupadi's father. Duryodhana thought what happened in the dice hall would stay in the dice hall. Instead, the humiliation of one woman brought her father, her brother and their entire kingdom to this field. Wrongs done to one person rarely stay small.`
      },
      {
        heading: 'The anxious catalogue.',
        text: `Duryodhana should be rallying his own side. Instead he spends verse after verse listing the enemy's strengths. Anyone who has lain awake listing every way something could go wrong knows this state. A frightened mind multiplies threats and forgets its own ground. Krishna will soon teach the opposite: steadiness, the ability to stay balanced in the face of whatever comes.`
      }
    ],
    questions: [
      {
        id: 'ph14_1',
        prompt: 'Why does Duryodhana measure every enemy warrior against Bhima and Arjuna?',
        options: ['They were the only warriors he knew', 'They were the oldest on the field', 'They were whom he feared most, and fear became his yardstick', 'It was meant as a compliment to them'],
        correct: 2,
        explanation: 'What we fear most quietly becomes the lens for everything we see.'
      },
      {
        id: 'ph14_2',
        prompt: 'He names Bhima before the greater archer, Arjuna. What does that suggest?',
        options: ['The person we have wronged most is often the one we fear most', 'Bhima was physically larger', 'He listed them by age', 'Arjuna had not yet arrived'],
        correct: 0,
        explanation: "Bhima's vow from the dice hall had haunted Duryodhana for thirteen years."
      },
      {
        id: 'ph14_3',
        prompt: "What does King Virata's presence on the field quietly prove?",
        options: ['Virata enjoyed war', 'Every king must pick a side', 'Wealth can always buy allies', 'A promise honestly kept leaves living witnesses'],
        correct: 3,
        explanation: "Virata sheltered the Pandavas and can testify that they kept their word, exposing Duryodhana's excuse."
      },
      {
        id: 'ph14_4',
        prompt: "Duryodhana took Krishna's army; Arjuna took Krishna. Satyaki chose the Pandavas. What is the lesson?",
        options: ['More soldiers guarantee victory', 'Loyalty that is earned outlasts loyalty that is acquired', 'Krishna favored neither side', 'Armies are useless in the end'],
        correct: 1,
        explanation: 'Duryodhana gathered resources; the Pandavas gathered devotion.'
      },
      {
        id: 'ph14_5',
        prompt: "Why would a leader list the enemy's strengths instead of rallying his own side?",
        options: ['Careful military strategy', 'Politeness toward the enemy', 'Boredom before the battle', 'A fearful mind multiplies threats and forgets its own ground'],
        correct: 3,
        explanation: 'His anxious catalogue is the opposite of the steadiness Krishna will teach.'
      }
    ]
  },
  {
    id: 'ph_bg1_5',
    verseRef: 'BG 1.5',
    title: 'Every Name Carries a Past',
    sanskrit: {
      roman: 'dhṛṣṭaketuś cekitānaḥ kāśirājaś ca vīryavān\npurujit kuntibhojaś ca śaibyaś ca nara-puṅgavaḥ',
      dev: 'धृष्टकेतुश्चेकितानः काशिराजश्च वीर्यवान्।\nपुरुजित्कुन्तिभोजश्च शैब्यश्च नरपुङ्गवः॥'
    },
    english: `"Dhrishtaketu, Chekitana, and the valiant King of Kashi; Purujit, Kuntibhoja, and Shaibya, the finest among men."`,
    sections: [
      {
        heading: 'A roll call that is really a history.',
        text: `On the surface this verse is a list of names. Underneath, almost every name opens a door into the past. Nobody arrives on Kurukshetra empty-handed. Each warrior carries the choices, wounds and loyalties that brought him there. So do we, into every conflict of our lives.`
      },
      {
        heading: 'Dhrishtaketu: laying down an inherited grudge.',
        text: `Dhrishtaketu's father, King Shishupala, insulted Krishna again and again at Yudhishthira's coronation, until Krishna finally killed him. By the logic of revenge, the son should have hated Krishna and the Pandavas for life. Instead, he stands beside them. Now place him next to Duryodhana. Both were sons of men with grievances. Duryodhana picked up his father's resentment and made it his whole identity. Dhrishtaketu set his father's grievance down and chose what was right. Our upbringing shapes the questions life asks us. Our choices are still the answers. This is the heart of the Gita's teaching on responsibility, and it appears here before Krishna says a word.`
      },
      {
        heading: "The mother's family simply shows up.",
        text: `Kuntibhoja raised Kunti, the Pandavas' mother, as his adopted daughter, and Purujit was his brother. So the Pandavas' maternal family stands with them. Compare that with Dhritarashtra's household, where love was possessive and the family was split into mine and theirs. Here is a family whose love does not calculate. It stands by its own because that is what family is for.`
      },
      {
        heading: 'The King of Kashi: consequences that travel across generations.',
        text: `Long ago, Bhishma carried off three princesses of Kashi as brides for his half-brother. Two of them became the mothers of Dhritarashtra and Pandu. The third, Amba, was rejected by everyone, swore to bring about Bhishma's death, and was reborn as the warrior Shikhandi, who will play a decisive part in Bhishma's fall. So the royal house of Kashi is the grandmother's family of both armies, and its king now stands against the Kurus. An act done decades earlier, with good intentions, is still unfolding. Actions keep bearing fruit long after the people who did them have moved on.`
      },
      {
        heading: 'Fear forces honesty.',
        text: `Duryodhana calls these men valiant, "the finest among men." In the comfort of his palace he mocked and belittled the Pandavas and their allies. Now, facing them, he praises them more honestly than ever. A real threat strips away pride. Sometimes we see others truly only when we can no longer afford not to.`
      },
      {
        heading: 'Karma, shown before it is taught.',
        text: `Insults at a coronation. An abduction two generations ago. A promise kept in disguise. A woman dragged through a hall. All of it has gathered on one field. Before Krishna explains that every action bears fruit, the battlefield itself displays it.`
      }
    ],
    questions: [
      {
        id: 'ph15_1',
        prompt: "Dhrishtaketu's father was killed by Krishna, yet he fights beside Krishna. What does his choice show?",
        options: ['Inherited grudges can be laid down by choice', 'Revenge is a sacred duty', 'He never learned who killed his father', 'He was forced to fight there'],
        correct: 0,
        explanation: "He refused to make his father's grievance his own, the very thing Duryodhana could not do."
      },
      {
        id: 'ph15_2',
        prompt: 'Dhrishtaketu and Duryodhana both had fathers with grievances. What made their paths so different?',
        options: ['Their wealth', 'What each chose to do with what he inherited', 'Their teachers', 'Pure luck'],
        correct: 1,
        explanation: 'Upbringing shaped them both, but each still made his own choice.'
      },
      {
        id: 'ph15_3',
        prompt: "The Pandavas' maternal family stands beside them. How does it contrast with Dhritarashtra's household?",
        options: ['They were wealthier', 'They had larger armies', 'Their love stood by family without dividing it into mine and theirs', 'They had always hated the Kauravas'],
        correct: 2,
        explanation: 'Possessive love split one family; simple loyalty held another together.'
      },
      {
        id: 'ph15_4',
        prompt: 'The King of Kashi recalls something Bhishma did two generations earlier. What does this suggest?',
        options: ['Old stories rarely matter', 'Bhishma had forgotten the past', 'Kingdoms forgive and forget easily', 'Actions keep bearing fruit long after they are done'],
        correct: 3,
        explanation: "Bhishma's old act is still unfolding on this battlefield."
      },
      {
        id: 'ph15_5',
        prompt: 'Facing his enemies, Duryodhana praises them more honestly than ever before. Why?',
        options: ['A real threat strips away pride and forces clear sight', 'He was being sarcastic', 'He was planning to switch sides', 'Battlefield courtesy required it'],
        correct: 0,
        explanation: 'When we can no longer afford illusions, we finally see others as they are.'
      }
    ]
  }
];

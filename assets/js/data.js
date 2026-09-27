/* ==========================================================================
   Codebusters Training Center — data: quotes, keywords and word lists
   ========================================================================== */
(function (root) {
  'use strict';

  // [quote, author]
  const QUOTES_EN = [
    ["The best way to predict the future is to create it.", "Peter Drucker"],
    ["Imagination is more important than knowledge.", "Albert Einstein"],
    ["It always seems impossible until it is done.", "Nelson Mandela"],
    ["The only way to do great work is to love what you do.", "Steve Jobs"],
    ["In the middle of difficulty lies opportunity.", "Albert Einstein"],
    ["Well done is better than well said.", "Benjamin Franklin"],
    ["Tell me and I forget. Teach me and I remember. Involve me and I learn.", "Benjamin Franklin"],
    ["An investment in knowledge pays the best interest.", "Benjamin Franklin"],
    ["Do what you can, with what you have, where you are.", "Theodore Roosevelt"],
    ["Believe you can and you are halfway there.", "Theodore Roosevelt"],
    ["The secret of getting ahead is getting started.", "Mark Twain"],
    ["Kindness is the language which the deaf can hear and the blind can see.", "Mark Twain"],
    ["Whatever you are, be a good one.", "Abraham Lincoln"],
    ["I have not failed. I have just found ten thousand ways that will not work.", "Thomas Edison"],
    ["Genius is one percent inspiration and ninety nine percent perspiration.", "Thomas Edison"],
    ["Nothing in life is to be feared, it is only to be understood.", "Marie Curie"],
    ["Be less curious about people and more curious about ideas.", "Marie Curie"],
    ["Somewhere, something incredible is waiting to be known.", "Carl Sagan"],
    ["Science is a way of thinking much more than it is a body of knowledge.", "Carl Sagan"],
    ["The important thing is not to stop questioning.", "Albert Einstein"],
    ["Life is like riding a bicycle. To keep your balance you must keep moving.", "Albert Einstein"],
    ["If I have seen further it is by standing on the shoulders of giants.", "Isaac Newton"],
    ["What we know is a drop, what we do not know is an ocean.", "Isaac Newton"],
    ["Research is what I am doing when I do not know what I am doing.", "Wernher von Braun"],
    ["The good thing about science is that it is true whether or not you believe in it.", "Neil deGrasse Tyson"],
    ["Equipped with his five senses, man explores the universe around him and calls the adventure science.", "Edwin Hubble"],
    ["Mathematics is the language with which God has written the universe.", "Galileo Galilei"],
    ["Measure what is measurable, and make measurable what is not so.", "Galileo Galilei"],
    ["The saddest aspect of life right now is that science gathers knowledge faster than society gathers wisdom.", "Isaac Asimov"],
    ["Never stop learning, because life never stops teaching.", "Unknown"],
    ["A person who never made a mistake never tried anything new.", "Albert Einstein"],
    ["Try not to become a man of success, but rather try to become a man of value.", "Albert Einstein"],
    ["Education is the most powerful weapon which you can use to change the world.", "Nelson Mandela"],
    ["The journey of a thousand miles begins with one step.", "Lao Tzu"],
    ["Knowing yourself is the beginning of all wisdom.", "Aristotle"],
    ["We are what we repeatedly do. Excellence, then, is not an act, but a habit.", "Will Durant"],
    ["The only true wisdom is in knowing you know nothing.", "Socrates"],
    ["It does not matter how slowly you go as long as you do not stop.", "Confucius"],
    ["Our greatest glory is not in never falling, but in rising every time we fall.", "Confucius"],
    ["Everything has beauty, but not everyone sees it.", "Confucius"],
    ["The man who moves a mountain begins by carrying away small stones.", "Confucius"],
    ["Quality is not an act, it is a habit.", "Aristotle"],
    ["Happiness depends upon ourselves.", "Aristotle"],
    ["Great minds discuss ideas; average minds discuss events; small minds discuss people.", "Eleanor Roosevelt"],
    ["The future belongs to those who believe in the beauty of their dreams.", "Eleanor Roosevelt"],
    ["You must do the thing you think you cannot do.", "Eleanor Roosevelt"],
    ["No one can make you feel inferior without your consent.", "Eleanor Roosevelt"],
    ["Do not count the days, make the days count.", "Muhammad Ali"],
    ["It is not the mountain we conquer, but ourselves.", "Edmund Hillary"],
    ["Keep your face always toward the sunshine and shadows will fall behind you.", "Walt Whitman"],
    ["The way to get started is to quit talking and begin doing.", "Walt Disney"],
    ["All our dreams can come true, if we have the courage to pursue them.", "Walt Disney"],
    ["If you can dream it, you can do it.", "Walt Disney"],
    ["Stay hungry, stay foolish.", "Steve Jobs"],
    ["Innovation distinguishes between a leader and a follower.", "Steve Jobs"],
    ["Simplicity is the ultimate sophistication.", "Leonardo da Vinci"],
    ["Learning never exhausts the mind.", "Leonardo da Vinci"],
    ["Once you have tasted flight, you will forever walk the earth with your eyes turned skyward.", "Leonardo da Vinci"],
    ["The noblest pleasure is the joy of understanding.", "Leonardo da Vinci"],
    ["Dream big and dare to fail.", "Norman Vaughan"],
    ["Success is not final, failure is not fatal: it is the courage to continue that counts.", "Winston Churchill"],
    ["A pessimist sees the difficulty in every opportunity; an optimist sees the opportunity in every difficulty.", "Winston Churchill"],
    ["Continuous effort, not strength or intelligence, is the key to unlocking our potential.", "Winston Churchill"],
    ["The pessimist complains about the wind; the optimist expects it to change; the realist adjusts the sails.", "William Arthur Ward"],
    ["Act as if what you do makes a difference. It does.", "William James"],
    ["Hitch your wagon to a star.", "Ralph Waldo Emerson"],
    ["Do not go where the path may lead, go instead where there is no path and leave a trail.", "Ralph Waldo Emerson"],
    ["What lies behind us and what lies before us are tiny matters compared to what lies within us.", "Ralph Waldo Emerson"],
    ["Go confidently in the direction of your dreams.", "Henry David Thoreau"],
    ["It is not enough to be busy. The question is: what are we busy about?", "Henry David Thoreau"],
    ["Not all those who wander are lost.", "J. R. R. Tolkien"],
    ["All we have to decide is what to do with the time that is given us.", "J. R. R. Tolkien"],
    ["It is our choices that show what we truly are, far more than our abilities.", "J. K. Rowling"],
    ["There is no friend as loyal as a book.", "Ernest Hemingway"],
    ["The more that you read, the more things you will know.", "Dr. Seuss"],
    ["You have brains in your head. You have feet in your shoes. You can steer yourself any direction you choose.", "Dr. Seuss"],
    ["Today you are you, that is truer than true.", "Dr. Seuss"],
    ["Why fit in when you were born to stand out?", "Dr. Seuss"],
    ["If you want to go fast, go alone. If you want to go far, go together.", "African Proverb"],
    ["Alone we can do so little; together we can do so much.", "Helen Keller"],
    ["Optimism is the faith that leads to achievement.", "Helen Keller"],
    ["The best and most beautiful things in the world cannot be seen or even touched.", "Helen Keller"],
    ["Life is either a daring adventure or nothing at all.", "Helen Keller"],
    ["Coming together is a beginning; keeping together is progress; working together is success.", "Henry Ford"],
    ["Whether you think you can or you think you cannot, you are right.", "Henry Ford"],
    ["Failure is simply the opportunity to begin again, this time more intelligently.", "Henry Ford"],
    ["The expert in anything was once a beginner.", "Helen Hayes"],
    ["Practice makes progress, not perfection.", "Unknown"],
    ["Every accomplishment starts with the decision to try.", "John F. Kennedy"],
    ["We choose to go to the moon not because it is easy, but because it is hard.", "John F. Kennedy"],
    ["That is one small step for a man, one giant leap for mankind.", "Neil Armstrong"],
    ["The Earth is the cradle of humanity, but mankind cannot stay in the cradle forever.", "Konstantin Tsiolkovsky"],
    ["Look up at the stars and not down at your feet.", "Stephen Hawking"],
    ["Intelligence is the ability to adapt to change.", "Stephen Hawking"],
    ["However difficult life may seem, there is always something you can do and succeed at.", "Stephen Hawking"],
    ["Nature does nothing uselessly.", "Aristotle"],
    ["In every walk with nature one receives far more than he seeks.", "John Muir"],
    ["The mountains are calling and I must go.", "John Muir"],
    ["Look deep into nature, and then you will understand everything better.", "Albert Einstein"],
    ["Adopt the pace of nature: her secret is patience.", "Ralph Waldo Emerson"],
    ["The earth has music for those who listen.", "George Santayana"],
    ["We do not inherit the earth from our ancestors; we borrow it from our children.", "Native American Proverb"],
    ["The greatest threat to our planet is the belief that someone else will save it.", "Robert Swan"],
    ["What you do makes a difference, and you have to decide what kind of difference you want to make.", "Jane Goodall"],
    ["Only if we understand, will we care. Only if we care, will we help.", "Jane Goodall"],
    ["In the end we will conserve only what we love.", "Baba Dioum"],
    ["Where there is a will, there is a way.", "Proverb"],
    ["Actions speak louder than words.", "Proverb"],
    ["Rome was not built in a day.", "Proverb"],
    ["Two heads are better than one.", "Proverb"],
    ["Curiosity is the wick in the candle of learning.", "William Arthur Ward"],
    ["The mind is not a vessel to be filled but a fire to be kindled.", "Plutarch"],
    ["Wisdom begins in wonder.", "Socrates"],
    ["An unexamined life is not worth living.", "Socrates"],
    ["Patience is bitter, but its fruit is sweet.", "Jean-Jacques Rousseau"],
    ["The secret of change is to focus all of your energy not on fighting the old, but on building the new.", "Dan Millman"],
    ["It is during our darkest moments that we must focus to see the light.", "Aristotle Onassis"],
    ["Do not let what you cannot do interfere with what you can do.", "John Wooden"],
    ["Be quick, but do not hurry.", "John Wooden"],
    ["Hard work beats talent when talent does not work hard.", "Tim Notke"],
    ["You miss one hundred percent of the shots you do not take.", "Wayne Gretzky"],
    ["It is kind of fun to do the impossible.", "Walt Disney"],
    ["The difference between ordinary and extraordinary is that little extra.", "Jimmy Johnson"],
    ["A goal without a plan is just a wish.", "Antoine de Saint-Exupery"],
    ["What is essential is invisible to the eye.", "Antoine de Saint-Exupery"],
    ["Logic will get you from A to B. Imagination will take you everywhere.", "Albert Einstein"],
    ["Anyone who has never made a mistake has never tried anything new.", "Albert Einstein"],
    ["A ship in harbor is safe, but that is not what ships are built for.", "John A. Shedd"],
    ["The beautiful thing about learning is that no one can take it away from you.", "B. B. King"],
    ["If you are not willing to learn, no one can help you.", "Zig Ziglar"],
    ["Mistakes are proof that you are trying.", "Jennifer Lim"],
    ["Great things are done by a series of small things brought together.", "Vincent van Gogh"],
    ["I dream my painting and I paint my dream.", "Vincent van Gogh"],
    ["Creativity is intelligence having fun.", "Albert Einstein"],
    ["Everything you can imagine is real.", "Pablo Picasso"],
    ["Action is the foundational key to all success.", "Pablo Picasso"],
    ["The purpose of our lives is to be happy.", "Dalai Lama"],
    ["If you light a lamp for somebody, it will also brighten your path.", "Buddha"],
    ["Code is like humor. When you have to explain it, it is bad.", "Cory House"],
    ["First, solve the problem. Then, write the code.", "John Johnson"],
    ["The computer was born to solve problems that did not exist before.", "Bill Gates"],
    ["The science of today is the technology of tomorrow.", "Edward Teller"],
    ["Few things are harder to put up with than the annoyance of a good example.", "Mark Twain"],
    ["Courage is grace under pressure.", "Ernest Hemingway"],
    ["The harder the conflict, the more glorious the triumph.", "Thomas Paine"],
    ["Energy and persistence conquer all things.", "Benjamin Franklin"],
    ["Little by little, one travels far.", "J. R. R. Tolkien"],
    ["A smooth sea never made a skilled sailor.", "Franklin D. Roosevelt"],
    ["Opportunities multiply as they are seized.", "Sun Tzu"],
    ["Clear thinking requires courage rather than intelligence.", "Thomas Szasz"],
    ["Honesty is the first chapter in the book of wisdom.", "Thomas Jefferson"],
    ["I find that the harder I work, the more luck I seem to have.", "Thomas Jefferson"],
    ["Well begun is half done.", "Aristotle"],
    ["Knowledge is power.", "Francis Bacon"],
    ["Reading maketh a full man; conference a ready man; and writing an exact man.", "Francis Bacon"],
    ["Truth is the daughter of time, not of authority.", "Francis Bacon"],
    ["There is nothing either good or bad, but thinking makes it so.", "William Shakespeare"],
    ["We know what we are, but know not what we may be.", "William Shakespeare"],
    ["All the world is a stage, and all the men and women merely players.", "William Shakespeare"],
    ["It is not in the stars to hold our destiny but in ourselves.", "William Shakespeare"],
    ["Elementary, my dear Watson.", "Sherlock Holmes"],
    ["When you have eliminated the impossible, whatever remains, however improbable, must be the truth.", "Arthur Conan Doyle"],
    ["There is nothing more deceptive than an obvious fact.", "Arthur Conan Doyle"],
    ["The world is full of obvious things which nobody by any chance ever observes.", "Arthur Conan Doyle"],
    ["Three may keep a secret, if two of them are dead.", "Benjamin Franklin"],
    ["Few persons can be made to believe that it is not quite an easy thing to invent a method of secret writing.", "Edgar Allan Poe"],
    ["Human ingenuity cannot concoct a cipher which human ingenuity cannot resolve.", "Edgar Allan Poe"],
    ["Sometimes it is the people no one imagines anything of who do the things that no one can imagine.", "Alan Turing"],
    ["We can only see a short distance ahead, but we can see plenty there that needs to be done.", "Alan Turing"],
    ["Mathematics knows no races or geographic boundaries.", "David Hilbert"],
    ["Pure mathematics is, in its way, the poetry of logical ideas.", "Albert Einstein"],
    ["Without mathematics, there is nothing you can do. Everything around you is mathematics.", "Shakuntala Devi"],
    ["The only way to learn mathematics is to do mathematics.", "Paul Halmos"],
    ["Do not worry about your difficulties in mathematics. I assure you mine are still greater.", "Albert Einstein"]
  ];

  // [spanish, english translation]  — common sayings (refranes) and quotes
  const QUOTES_ES = [
    ["Más vale tarde que nunca.", "Better late than never."],
    ["Poco a poco se va lejos.", "Little by little one goes far."],
    ["El que busca, encuentra.", "He who seeks, finds."],
    ["No hay mal que por bien no venga.", "Every cloud has a silver lining."],
    ["Dime con quién andas y te diré quién eres.", "Tell me who you walk with and I will tell you who you are."],
    ["A quien madruga, Dios le ayuda.", "God helps the early riser."],
    ["Querer es poder.", "Where there is a will, there is a way."],
    ["La práctica hace al maestro.", "Practice makes the master."],
    ["El tiempo es oro.", "Time is gold."],
    ["En boca cerrada no entran moscas.", "Flies do not enter a closed mouth."],
    ["Camarón que se duerme se lo lleva la corriente.", "The shrimp that falls asleep is carried away by the current."],
    ["Ojos que no ven, corazón que no siente.", "Out of sight, out of mind."],
    ["Más vale prevenir que curar.", "Prevention is better than cure."],
    ["El saber no ocupa lugar.", "Knowledge takes up no space."],
    ["Donde hay voluntad, hay un camino.", "Where there is a will, there is a way."],
    ["La unión hace la fuerza.", "Unity makes strength."],
    ["No dejes para mañana lo que puedes hacer hoy.", "Do not leave for tomorrow what you can do today."],
    ["Cada día se aprende algo nuevo.", "Every day you learn something new."],
    ["Hablando se entiende la gente.", "People understand each other by talking."],
    ["El que no arriesga, no gana.", "He who risks nothing, gains nothing."],
    ["Al mal tiempo, buena cara.", "Put on a good face in bad times."],
    ["Mucho ruido y pocas nueces.", "Much ado about nothing."],
    ["Perro que ladra no muerde.", "A barking dog does not bite."],
    ["Del dicho al hecho hay mucho trecho.", "There is a long way from saying to doing."],
    ["Lo que bien empieza, bien acaba.", "What begins well ends well."],
    ["La paciencia es la madre de la ciencia.", "Patience is the mother of science."],
    ["Nunca es tarde para aprender.", "It is never too late to learn."],
    ["El conocimiento es poder.", "Knowledge is power."],
    ["La imaginación es más importante que el conocimiento.", "Imagination is more important than knowledge."],
    ["La vida es un sueño y los sueños, sueños son.", "Life is a dream, and dreams are dreams."],
    ["Caminante, no hay camino, se hace camino al andar.", "Traveler, there is no road; the road is made by walking."],
    ["El que lee mucho y anda mucho, ve mucho y sabe mucho.", "He who reads much and walks much sees much and knows much."],
    ["La ciencia es el alma de la prosperidad de las naciones.", "Science is the soul of the prosperity of nations."],
    ["Los sueños no tienen fecha de caducidad.", "Dreams have no expiration date."],
    ["Un buen amigo es un tesoro.", "A good friend is a treasure."],
    ["El éxito es la suma de pequeños esfuerzos repetidos día tras día.", "Success is the sum of small efforts repeated day after day."],
    ["La educación es el arma más poderosa para cambiar el mundo.", "Education is the most powerful weapon to change the world."],
    ["El arte de vencer se aprende en las derrotas.", "The art of winning is learned in defeats."],
    ["Solo sé que no sé nada.", "I only know that I know nothing."],
    ["La música es el lenguaje universal de la humanidad.", "Music is the universal language of humanity."],
    ["Tanto va el cántaro a la fuente que al final se rompe.", "The pitcher goes to the well so often that it finally breaks."],
    ["No es oro todo lo que reluce.", "All that glitters is not gold."],
    ["Quien siembra vientos recoge tempestades.", "Who sows winds reaps storms."],
    ["El hábito no hace al monje.", "The habit does not make the monk."],
    ["Cuando el río suena, agua lleva.", "When the river makes noise, it carries water."],
    ["Una imagen vale más que mil palabras.", "A picture is worth a thousand words."],
    ["A caballo regalado no se le mira el diente.", "Do not look a gift horse in the mouth."],
    ["Después de la tormenta siempre llega la calma.", "After the storm, calm always comes."],
    ["El mundo es un libro y quienes no viajan leen solo una página.", "The world is a book, and those who do not travel read only one page."],
    ["La mejor forma de predecir el futuro es crearlo.", "The best way to predict the future is to create it."],
    ["Los científicos estudian la naturaleza para entender el universo.", "Scientists study nature to understand the universe."],
    ["El planeta Tierra es nuestro único hogar.", "Planet Earth is our only home."],
    ["Mañana será otro día.", "Tomorrow will be another day."],
    ["El niño pequeño aprende español con su familia.", "The little boy learns Spanish with his family."]
  ];

  // Keywords for K1 alphabets, Porta, Fractionated Morse, Polybius squares...
  const KEYWORDS = [
    'SCIENCE', 'OLYMPIAD', 'CIPHER', 'SECRET', 'MYSTERY', 'PUZZLE', 'DECODE', 'BREAKER', 'FREQUENCY',
    'ALPHABET', 'KEYWORD', 'CRYPTOGRAM', 'MACHINERY', 'NOTEBOOK', 'LIBRARY', 'TELESCOPE', 'VOLCANO',
    'GALAXY', 'PLANET', 'COMET', 'NEBULA', 'QUANTUM', 'MAGNET', 'CRYSTAL', 'FOSSIL', 'GLACIER',
    'THUNDER', 'LIGHTNING', 'HURRICANE', 'TORNADO', 'CANYON', 'DESERT', 'FOREST', 'MEADOW', 'RIVER',
    'ISLAND', 'HARBOR', 'LANTERN', 'COMPASS', 'JOURNEY', 'EXPLORER', 'PIONEER', 'CASTLE', 'DRAGON',
    'WIZARD', 'KNIGHT', 'PHOENIX', 'FALCON', 'DOLPHIN', 'PENGUIN', 'OCTOPUS', 'BUTTERFLY', 'KANGAROO',
    'ELEPHANT', 'GIRAFFE', 'CHEETAH', 'PANTHER', 'TRIANGLE', 'SQUARE', 'CIRCLE', 'PYRAMID', 'MARBLE',
    'SPECTRUM', 'RAINBOW', 'SUNSHINE', 'MOONLIGHT', 'STARDUST', 'WINTER', 'SUMMER', 'AUTUMN', 'HOLIDAY',
    'BICYCLE', 'AIRPLANE', 'ROCKET', 'SATELLITE', 'COMPUTER', 'KEYBOARD', 'ROBOTICS', 'NETWORK',
    'CHEMISTRY', 'BIOLOGY', 'PHYSICS', 'GEOLOGY', 'ECOLOGY', 'ANATOMY', 'MOLECULE', 'NEUTRON',
    'PROTON', 'ELECTRON', 'GRAVITY', 'VELOCITY', 'MOMENTUM', 'FRICTION', 'PENDULUM', 'MICROSCOPE',
    'TREASURE', 'ADVENTURE', 'CHAMPION', 'VICTORY', 'TEAMWORK', 'STRATEGY', 'PATIENCE', 'CURIOSITY'
  ];
  // Four distinct letters, no J (for the Homophonic keyword)
  const HOMOPHONIC_KEYS = [
    'WORK', 'MATH', 'CODE', 'STAR', 'MOON', 'BLUE', 'FISH', 'BIRD', 'TREE', 'LION',
    'WOLF', 'BEAR', 'DUCK', 'GOLD', 'IRON', 'SALT', 'WAVE', 'WIND', 'RAIN', 'SNOW', 'FIRE', 'LAKE',
    'ROCK', 'SAND', 'CLAY', 'SHIP', 'BOAT', 'KITE', 'DRUM', 'HORN', 'LAMP', 'DESK', 'BOOK', 'PAGE',
    'WORD', 'NOTE', 'SONG', 'PLAY', 'GAME', 'CUBE', 'KING', 'QUIZ', 'ATOM', 'CELL', 'GENE', 'PATH',
    'ROAD', 'MAZE', 'CLUE', 'HINT', 'LOCK', 'KEYS', 'BOLT', 'MIND', 'IDEA', 'PLAN', 'GOAL', 'HOPE',
    'CAMP', 'PARK', 'FARM', 'CORN', 'PLUM', 'LIME', 'PEAR', 'SOUP', 'CAKE', 'MILK', 'TOAD', 'FROG',
    'CRAB', 'SEAL', 'DOVE', 'HAWK', 'CROW', 'OWLS', 'MOLD', 'LENS', 'BEAM', 'VOLT', 'WATT', 'HEAT'
  ].filter(w => new Set(w).size === 4 && !w.includes('J'));

  // Five-letter words with five different letters (Checkerboard headers, anagram game)
  const ISO5 = [
    'ALERT', 'PLANT', 'BRICK', 'FAKED', 'ROCKS', 'GUARD', 'CHAIR', 'SOLVE', 'LIGHT', 'NIGHT', 'MIGHT',
    'SIGHT', 'FIGHT', 'WORLD', 'HOUSE', 'MOUSE', 'HORSE', 'CLOUD', 'STORM', 'FLAME', 'GRAPE', 'PLUMB',
    'CRANE', 'SLATE', 'TRAIN', 'BRAIN', 'STAIR', 'FRUIT', 'SWEPT', 'CHOIR', 'BLAST', 'CRUST', 'DWARF',
    'EARTH', 'FORUM', 'GHOST', 'HONEY', 'JUMPY', 'KNIFE', 'LEMON', 'MANGO', 'NOBLE', 'OCEAN', 'PIANO',
    'QUERY', 'RADIO', 'SCOUT', 'TIGER', 'ULTRA', 'VOCAL', 'WHALE', 'YOUTH', 'ZEBRA', 'BLOCK', 'CLAMP',
    'DRINK', 'FROST', 'GLOVE', 'HASTE', 'IVORY', 'LUCKY', 'MARSH', 'NERDY', 'ORBIT', 'PRISM', 'QUILT',
    'RELAY', 'SPORT', 'THUMB', 'UNCLE', 'VAPOR', 'WRIST', 'BACON', 'CODES', 'DECOY', 'FLASH', 'GIANT',
    'HUMAN', 'JOKER', 'LASER', 'MOTEL', 'NORTH', 'OPERA', 'PARTY', 'QUART', 'ROUND', 'SHAPE', 'TOPIC',
    'UNITE', 'VIDEO', 'WAGON', 'BOAST', 'CHEST', 'DOUBT', 'FEAST', 'GRAIN', 'HEART', 'INDEX', 'LATER',
    'MOVIE', 'NOISY', 'OTHER', 'PLAID', 'ROAST', 'SMART', 'TRUCK', 'WALTZ', 'BLEND', 'CHARM', 'DEPTH',
    'FIRST', 'GLAND', 'HOIST', 'LINES', 'MINUS', 'NAILS', 'PAINT', 'REACH', 'SAINT', 'TABLE', 'VOTER'
  ].filter(w => new Set(w).size === 5);

  // Ten-letter isograms (Cryptarithm answers — ten letters for ten digits)
  const ISO10 = [
    'BLACKSMITH', 'LUMBERJACK', 'PATHFINDER', 'NIGHTMARES', 'TRAMPOLINE', 'MOTHERLAND', 'FARSIGHTED',
    'HANDSOMELY', 'EXHAUSTION', 'IMPORTANCE', 'DESPICABLY', 'PLAYGROUND', 'REPUBLICAN', 'COPYRIGHTS',
    'HYDROPLANE', 'NEIGHBOURS', 'UNSOCIABLE', 'BACKGROUND', 'CAMPGROUND', 'COMPATIBLE', 'DUMBWAITER',
    'SPORTINGLY', 'CUMBERLAND', 'PITCHFORKS', 'BANKRUPTCY', 'FLOWCHARTS', 'AUTHORIZED', 'MISCHARGED'
  ].filter(w => w.length === 10 && new Set(w).size === 10);

  // Common five-letter words (Word Baconian carrier words)
  const WORDS5 = (
    'ABOUT ABOVE ACTOR ADMIT ADOPT AFTER AGAIN AGENT AGREE AHEAD ALARM ALBUM ALERT ALIKE ALIVE ALLOW ALONE ALONG ' +
    'AMONG ANGEL ANGER ANGLE ANGRY APART APPLE APPLY ARENA ARGUE ARISE ARRAY ASIDE AUDIO AVOID AWARD AWARE BADLY ' +
    'BAKER BASIC BEACH BEGAN BEGIN BEGUN BEING BELOW BENCH BIRTH BLACK BLAME BLANK BLIND BLOCK BLOOD BOARD BOOST ' +
    'BOUND BRAIN BRAND BREAD BREAK BRIEF BRING BROAD BROKE BROWN BUILD BUILT BUYER CABLE CALM CARRY CATCH CAUSE ' +
    'CHAIN CHAIR CHART CHASE CHEAP CHECK CHEST CHIEF CHILD CHINA CHOSE CIVIL CLAIM CLASS CLEAN CLEAR CLIMB CLOCK ' +
    'CLOSE COACH COAST COULD COUNT COURT COVER CRAFT CRASH CREAM CRIME CROSS CROWD CROWN CURVE CYCLE DAILY DANCE ' +
    'DATED DEALT DEATH DEBUT DELAY DEPTH DOING DOUBT DOZEN DRAFT DRAMA DRAWN DREAM DRESS DRINK DRIVE DROVE DYING ' +
    'EAGER EARLY EARTH EIGHT ELITE EMPTY ENEMY ENJOY ENTER ENTRY EQUAL ERROR EVENT EVERY EXACT EXIST EXTRA FAITH ' +
    'FALSE FAULT FIBER FIELD FIFTH FIFTY FIGHT FINAL FIRST FIXED FLASH FLEET FLOOR FLUID FOCUS FORCE FORTH FORTY ' +
    'FORUM FOUND FRAME FRANK FRAUD FRESH FRONT FRUIT FULLY FUNNY GIANT GIVEN GLASS GLOBE GOING GRACE GRADE GRAND ' +
    'GRANT GRASS GREAT GREEN GROSS GROUP GROWN GUARD GUESS GUEST GUIDE HAPPY HEART HEAVY HENCE HORSE HOTEL HOUSE ' +
    'HUMAN IDEAL IMAGE INDEX INNER INPUT ISSUE JOINT JUDGE KNOWN LABEL LARGE LASER LATER LAUGH LAYER LEARN LEASE ' +
    'LEAST LEAVE LEGAL LEVEL LIGHT LIMIT LINKS LIVES LOCAL LOGIC LOOSE LOWER LUCKY LUNCH LYING MAGIC MAJOR MAKER ' +
    'MARCH MARIA MATCH MAYBE MAYOR MEANT MEDIA METAL MIGHT MINOR MINUS MIXED MODEL MONEY MONTH MORAL MOTOR MOUNT ' +
    'MOUSE MOUTH MOVIE MUSIC NEEDS NEVER NEWLY NIGHT NOISE NORTH NOTED NOVEL NURSE OCCUR OCEAN OFFER OFTEN ORDER ' +
    'OTHER OUGHT PAINT PANEL PAPER PARTY PEACE PHASE PHONE PHOTO PIECE PILOT PITCH PLACE PLAIN PLANE PLANT PLATE ' +
    'POINT POUND POWER PRESS PRICE PRIDE PRIME PRINT PRIOR PRIZE PROOF PROUD PROVE QUEEN QUICK QUIET QUITE RADIO ' +
    'RAISE RANGE RAPID RATIO REACH READY REFER RIGHT RIVAL RIVER ROBOT ROUGH ROUND ROUTE ROYAL RURAL SCALE SCENE ' +
    'SCOPE SCORE SENSE SERVE SEVEN SHALL SHAPE SHARE SHARP SHEET SHELF SHELL SHIFT SHIRT SHOCK SHOOT SHORT SHOWN ' +
    'SIGHT SINCE SIXTY SIZED SKILL SLEEP SLIDE SMALL SMART SMILE SMOKE SOLID SOLVE SORRY SOUND SOUTH SPACE SPARE ' +
    'SPEAK SPEED SPEND SPENT SPLIT SPOKE SPORT STAFF STAGE STAKE STAND START STATE STEAM STEEL STICK STILL STOCK ' +
    'STONE STOOD STORE STORM STORY STRIP STUCK STUDY STUFF STYLE SUGAR SUITE SUPER SWEET TABLE TAKEN TASTE TAXES ' +
    'TEACH TEETH THANK THEFT THEIR THEME THERE THESE THICK THING THINK THIRD THOSE THREE THREW THROW TIGHT TIMES ' +
    'TIRED TITLE TODAY TOPIC TOTAL TOUCH TOUGH TOWER TRACK TRADE TRAIN TREAT TREND TRIAL TRIED TRUCK TRULY TRUST ' +
    'TRUTH TWICE UNDER UNION UNITY UNTIL UPPER UPSET URBAN USAGE USUAL VALID VALUE VIDEO VIRUS VISIT VITAL VOICE ' +
    'WASTE WATCH WATER WHEEL WHERE WHICH WHILE WHITE WHOLE WHOSE WOMAN WORLD WORRY WORSE WORST WORTH WOULD WOUND ' +
    'WRITE WRONG WROTE YIELD YOUNG YOUTH ZEBRA QUOTA JAZZY FIZZY PIZZA KAYAK LLAMA HAPPY FUZZY VIVID OXIDE EXPEL'
  ).split(' ').filter(w => w.length === 5);

  // Letter frequencies (percent)
  const FREQ_EN = {
    E: 12.7, T: 9.1, A: 8.2, O: 7.5, I: 7.0, N: 6.7, S: 6.3, H: 6.1, R: 6.0, D: 4.3, L: 4.0, C: 2.8, U: 2.8,
    M: 2.4, W: 2.4, F: 2.2, G: 2.0, Y: 2.0, P: 1.9, B: 1.5, V: 1.0, K: 0.8, J: 0.15, X: 0.15, Q: 0.1, Z: 0.07
  };
  const FREQ_ES = {
    E: 13.7, A: 12.5, O: 8.7, S: 8.0, R: 6.9, N: 6.7, I: 6.3, D: 5.9, L: 5.0, C: 4.7, T: 4.6, U: 3.9, M: 3.2,
    P: 2.5, B: 1.4, G: 1.0, V: 0.9, Y: 0.9, Q: 0.9, H: 0.7, F: 0.7, Z: 0.5, J: 0.4, 'Ñ': 0.3, X: 0.2, K: 0.02, W: 0.01
  };

  // Common short English words for pattern practice
  const COMMON_EN = {
    1: ['A', 'I'],
    2: ['OF', 'TO', 'IN', 'IT', 'IS', 'BE', 'AS', 'AT', 'SO', 'WE', 'HE', 'BY', 'OR', 'ON', 'DO', 'IF', 'ME', 'MY', 'UP', 'AN', 'GO', 'NO', 'US', 'AM'],
    3: ['THE', 'AND', 'FOR', 'ARE', 'BUT', 'NOT', 'YOU', 'ALL', 'ANY', 'CAN', 'HAD', 'HER', 'WAS', 'ONE', 'OUR', 'OUT', 'DAY', 'GET', 'HAS', 'HIM', 'HIS', 'HOW', 'MAN', 'NEW', 'NOW', 'OLD', 'SEE', 'TWO', 'WAY', 'WHO', 'ITS', 'LET', 'SAY', 'SHE', 'TOO', 'USE'],
    4: ['THAT', 'WITH', 'HAVE', 'THIS', 'WILL', 'YOUR', 'FROM', 'THEY', 'KNOW', 'WANT', 'BEEN', 'GOOD', 'MUCH', 'SOME', 'TIME', 'VERY', 'WHEN', 'COME', 'HERE', 'JUST', 'LIKE', 'LONG', 'MAKE', 'MANY', 'MORE', 'ONLY', 'OVER', 'SUCH', 'TAKE', 'THAN', 'THEM', 'WELL', 'WERE', 'WHAT', 'LIFE']
  };
  // Pattern words: repeated-letter shapes that jump out in Aristocrats
  const PATTERN_WORDS = [
    'THAT', 'THERE', 'THESE', 'PEOPLE', 'LITTLE', 'LETTER', 'BETTER', 'MIDDLE', 'NEVER', 'EVERY', 'EVEN',
    'SEEMS', 'ALWAYS', 'BELIEVE', 'BEGINNING', 'DIFFERENCE', 'EXCELLENCE', 'SUCCESS', 'KNOWLEDGE',
    'ELEMENTARY', 'COMMITTEE', 'ASSESS', 'ALREADY', 'ANYTHING', 'SOMETHING', 'SCIENCE', 'DEEPEST',
    'ESSENTIAL', 'BALLOON', 'COOKBOOK', 'MISSISSIPPI', 'BOOKKEEPER', 'ADDRESS', 'ARRANGE', 'DOLLAR',
    'GREATEST', 'HAPPINESS', 'TOMORROW', 'THEREFORE', 'REMEMBER', 'EDUCATION', 'LEARNING', 'THOUGHT',
    'EXPERIENCE', 'POSSIBLE', 'IMPOSSIBLE', 'NOTHING', 'EVERYTHING', 'THOUSAND', 'BETWEEN', 'ANOTHER'
  ];
  // Frequent Spanish words for Xenocrypt study
  const SPANISH_WORDS = [
    ['DE', 'of / from'], ['LA', 'the (f.)'], ['QUE', 'that / which'], ['EL', 'the (m.)'], ['EN', 'in / on'],
    ['Y', 'and'], ['A', 'to'], ['LOS', 'the (m. pl.)'], ['SE', 'itself / oneself'], ['DEL', 'of the'],
    ['LAS', 'the (f. pl.)'], ['UN', 'a (m.)'], ['POR', 'by / for'], ['CON', 'with'], ['NO', 'no / not'],
    ['UNA', 'a (f.)'], ['SU', 'his / her / its'], ['PARA', 'for'], ['ES', 'is'], ['AL', 'to the'],
    ['LO', 'it / the'], ['COMO', 'like / as'], ['MAS', 'more'], ['PERO', 'but'], ['SUS', 'their'],
    ['LE', 'to him / her'], ['HA', 'has'], ['ME', 'me'], ['SI', 'if / yes'], ['SIN', 'without'],
    ['SOBRE', 'about / on'], ['ESTE', 'this'], ['YA', 'already'], ['ENTRE', 'between'], ['CUANDO', 'when'],
    ['TODO', 'all'], ['ESTA', 'this / is'], ['SER', 'to be'], ['SON', 'are'], ['DOS', 'two'],
    ['TAMBIEN', 'also'], ['FUE', 'was'], ['HABIA', 'there was'], ['ERA', 'was'], ['MUY', 'very'],
    ['HASTA', 'until'], ['DESDE', 'since / from'], ['MUCHO', 'a lot'], ['HACER', 'to do / make'],
    ['NUNCA', 'never'], ['SIEMPRE', 'always'], ['VIDA', 'life'], ['TIEMPO', 'time'], ['MUNDO', 'world'],
    ['HOMBRE', 'man'], ['MUJER', 'woman'], ['DIA', 'day'], ['NOCHE', 'night'], ['AMOR', 'love'],
    ['CIENCIA', 'science'], ['BUENO', 'good'], ['MEJOR', 'better / best'], ['GRANDE', 'big'], ['NUEVO', 'new'],
    ['AGUA', 'water'], ['TIERRA', 'earth / land'], ['CASA', 'house'], ['CAMINO', 'road / path'], ['SABER', 'to know'],
    ['QUIEN', 'who'], ['DONDE', 'where'], ['PORQUE', 'because'], ['NADA', 'nothing'], ['OTRO', 'other']
  ];

  root.CBDATA = {
    QUOTES_EN, QUOTES_ES, KEYWORDS, HOMOPHONIC_KEYS, ISO5, ISO10, WORDS5,
    FREQ_EN, FREQ_ES, COMMON_EN, PATTERN_WORDS, SPANISH_WORDS
  };
})(typeof window !== 'undefined' ? window : globalThis);

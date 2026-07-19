-- Coffee Vault — core schema
-- Applied automatically at API startup (see db/surreal.ts)

DEFINE TABLE user SCHEMAFULL;
DEFINE FIELD email ON user TYPE string ASSERT string::is::email($value);
DEFINE FIELD password_hash ON user TYPE string;
DEFINE FIELD created_at ON user TYPE datetime DEFAULT time::now();
DEFINE INDEX user_email_unique ON user FIELDS email UNIQUE;

DEFINE TABLE coffee_bean SCHEMAFULL;
DEFINE FIELD name ON coffee_bean TYPE string;
DEFINE FIELD roaster ON coffee_bean TYPE string;
DEFINE FIELD origin_country ON coffee_bean TYPE string;
DEFINE FIELD variety ON coffee_bean TYPE option<string>;
DEFINE FIELD process ON coffee_bean TYPE option<string>;
DEFINE FIELD roast_date ON coffee_bean TYPE option<datetime>;
DEFINE FIELD purchase_date ON coffee_bean TYPE option<datetime>;
DEFINE FIELD roast_level ON coffee_bean TYPE option<string>;
DEFINE FIELD tasting_notes ON coffee_bean TYPE array<string> DEFAULT [];
DEFINE FIELD recommended_methods ON coffee_bean TYPE array<string> DEFAULT [];
DEFINE FIELD owner ON coffee_bean TYPE record<user>;
DEFINE FIELD created_at ON coffee_bean TYPE datetime DEFAULT time::now();

DEFINE TABLE freezer_cycle SCHEMAFULL;
DEFINE FIELD bean ON freezer_cycle TYPE record<coffee_bean>;
DEFINE FIELD frozen_at ON freezer_cycle TYPE datetime;
DEFINE FIELD thawed_at ON freezer_cycle TYPE option<datetime>;
DEFINE FIELD notes ON freezer_cycle TYPE option<string>;
DEFINE FIELD created_at ON freezer_cycle TYPE datetime DEFAULT time::now();

DEFINE TABLE recipe SCHEMAFULL;
DEFINE FIELD name ON recipe TYPE string;
DEFINE FIELD bean ON recipe TYPE option<record<coffee_bean>>;
DEFINE FIELD dripper ON recipe TYPE option<string>;
DEFINE FIELD grind_setting ON recipe TYPE option<string>;
DEFINE FIELD water_temp_profile ON recipe TYPE option<string>;
DEFINE FIELD filter_type ON recipe TYPE option<string>;
DEFINE FIELD brew_steps ON recipe TYPE array<string> DEFAULT [];
DEFINE FIELD owner ON recipe TYPE record<user>;
DEFINE FIELD created_at ON recipe TYPE datetime DEFAULT time::now();

-- Coffee Vault — core schema
-- Applied automatically at API startup (see db/surreal.ts)
-- IF NOT EXISTS / OVERWRITE make this safe to re-run on every boot.

DEFINE TABLE OVERWRITE user SCHEMAFULL;
DEFINE FIELD OVERWRITE email ON user TYPE string ASSERT string::is_email($value);
DEFINE FIELD OVERWRITE password_hash ON user TYPE string;
DEFINE FIELD OVERWRITE created_at ON user TYPE datetime DEFAULT time::now();
DEFINE INDEX OVERWRITE user_email_unique ON user FIELDS email UNIQUE;

DEFINE TABLE OVERWRITE coffee_bean SCHEMAFULL;
DEFINE FIELD OVERWRITE name ON coffee_bean TYPE string;
DEFINE FIELD OVERWRITE roaster ON coffee_bean TYPE string;
DEFINE FIELD OVERWRITE origin_country ON coffee_bean TYPE string;
DEFINE FIELD OVERWRITE variety ON coffee_bean TYPE option<string>;
DEFINE FIELD OVERWRITE process ON coffee_bean TYPE option<string>;
DEFINE FIELD OVERWRITE roast_date ON coffee_bean TYPE option<datetime>;
DEFINE FIELD OVERWRITE purchase_date ON coffee_bean TYPE option<datetime>;
DEFINE FIELD OVERWRITE roast_level ON coffee_bean TYPE option<string>;
DEFINE FIELD OVERWRITE tasting_notes ON coffee_bean TYPE array<string> DEFAULT [];
DEFINE FIELD OVERWRITE recommended_methods ON coffee_bean TYPE array<string> DEFAULT [];
DEFINE FIELD OVERWRITE owner ON coffee_bean TYPE record<user>;
DEFINE FIELD OVERWRITE created_at ON coffee_bean TYPE datetime DEFAULT time::now();

DEFINE TABLE OVERWRITE freezer_cycle SCHEMAFULL;
DEFINE FIELD OVERWRITE bean ON freezer_cycle TYPE record<coffee_bean>;
DEFINE FIELD OVERWRITE frozen_at ON freezer_cycle TYPE datetime;
DEFINE FIELD OVERWRITE thawed_at ON freezer_cycle TYPE option<datetime>;
DEFINE FIELD OVERWRITE notes ON freezer_cycle TYPE option<string>;
DEFINE FIELD OVERWRITE created_at ON freezer_cycle TYPE datetime DEFAULT time::now();

DEFINE TABLE OVERWRITE recipe SCHEMAFULL;
DEFINE FIELD OVERWRITE name ON recipe TYPE string;
DEFINE FIELD OVERWRITE bean ON recipe TYPE option<record<coffee_bean>>;
DEFINE FIELD OVERWRITE dripper ON recipe TYPE option<string>;
DEFINE FIELD OVERWRITE grind_setting ON recipe TYPE option<string>;
DEFINE FIELD OVERWRITE water_temp_profile ON recipe TYPE option<string>;
DEFINE FIELD OVERWRITE filter_type ON recipe TYPE option<string>;
DEFINE FIELD OVERWRITE brew_steps ON recipe TYPE array<string> DEFAULT [];
DEFINE FIELD OVERWRITE owner ON recipe TYPE record<user>;
DEFINE FIELD OVERWRITE created_at ON recipe TYPE datetime DEFAULT time::now();

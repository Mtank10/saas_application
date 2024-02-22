import { Snowflake } from "@theinternetfolks/snowflake";

function generateSnowflakeId() {
   return Snowflake.generate();
}

export default generateSnowflakeId;
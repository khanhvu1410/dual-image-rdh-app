from pydantic import BaseModel

class ExtractRuleResponse(BaseModel):
    data_length: int
    extract_rule_min: dict
    extract_rule_max: dict
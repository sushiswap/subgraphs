import { Token } from "../../generated/schema"

export function getOrCreateToken(id: string): Token {
    let token = Token.load(id)
  
    if (token === null) {
      token = new Token(id)
      token.save()
    }
  
    return token as Token
  }
  
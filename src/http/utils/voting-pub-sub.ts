type Message = { pollOptionId: string, votes: number}
type Subcriber = ( message:Message) => void

class VotingPubSubs {
    private channels: Record< string, Subcriber[] > ={}
    
    subscribe(pollID:string, subscriber: Subcriber){
        if(!this.channels[pollID]) this.channels[pollID] = []
        
        this.channels[pollID].push(subscriber)
    }
    
    publish(pollID:string, message:Message){
        if(!this.channels[pollID]) return

        for(const subscriber of this.channels[pollID]){
            subscriber(message)
        }
    }
}

export const voting =  new VotingPubSubs()
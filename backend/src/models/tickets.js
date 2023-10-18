var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Paragraph = {
    text:   String,
    images: [{image: String, caption: String}]
}

var customField = {
    _id:        false,
    customField: {type: Schema.Types.Mixed, ref: 'CustomField'},
    text:       Schema.Types.Mixed
}

var SequenceSchema = new mongoose.Schema({
    _id: String,
    sequence_value: Number
});

var Sequence = mongoose.model('Sequence', SequenceSchema);

var TicketSchema = new Schema({
    id:                     Schema.Types.ObjectId,
    identifier:             Number, //incremental ID to be shown in the report
    title:                  String,
    vulnType:               String,
    description:            String,
    observation:            String,
    remediation:            String,
    remediationComplexity:  {type: Number, enum: [1,2,3]},
    priority:               {type: Number, enum: [1,2,3,4]},
    references:             [String],
    cvssv3:                 String,
    paragraphs:             [Paragraph],
    poc:                    String,
    scope:                  String,
    status:                 {type: Number, enum: [0,1], default: 1}, // 0: done, 1: redacting
    category:               String,
    customFields:           [customField],
    retestStatus:           {type: String, enum: ['ok', 'ko', 'unknown', 'partial']},
    retestDescription:      String
})

TicketSchema.statics.create = (findings) => {
    return new Promise((resolve, reject) => {
        Ticket.insertMany(findings)
        .then((rows) => {
            resolve(rows)
        })
        .catch((err) => {
            reject(err)
        })
    }
)};

// TicketSchema.statics.getLastIdentifier = () => {
//     return new Promise((resolve, reject) => {
//         Ticket.
//     })
// }

var Ticket = mongoose.model('Ticket', TicketSchema);
module.exports = Ticket;
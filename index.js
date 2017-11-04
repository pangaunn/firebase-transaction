const functions = require('firebase-functions')
const admin = require('firebase-admin')
admin.initializeApp(functions.config().firebase)

exports.stock =  functions.https.onRequest((req, res) => {
  let { Actions: action, ProductId: productId, Amount: amount } = req.query
  amount = parseInt(amount)
  if (action === 'Add') {
    admin.database().ref(`products/${productId}`).transaction(item => {
      if (item) {
        item.inStock = item.inStock + amount
      }
      return item
    }).then(() => {
      res.send('ok')
    })
  } else if (action === 'Deduct') {
    admin.database().ref(`products/${productId}`).transaction(item => {
      if (item) {
        if (item.inStock - amount < 0) {
          return
        }
        item.inStock = item.inStock - amount
        return item
      }
      return item
    }).then(({ committed }) => {
      if (committed) {
        res.send('ok')
      } else {
        res.status(500).send('Not enough amount')
      }
    }).catch(() => res.send('wrong dude'))
  } else if (action === 'Update') {
    admin.database().ref(`products/${productId}`).transaction(item => {
      if (item) {
        item.inStock = amount
      }
      return item
    }).then(() => {
      res.send('ok')
    })
  }
})

// exports.getBalance = functions.https.onRequest((req, res) => {
//   admin.database().ref('/balance').once('value').then(snapshot => {
//     res.send(`${snapshot.val()}`)
//   })
// })

// exports.withdraw = functions.https.onRequest((req, res) => {
//   let withdrawAmount = req.query.amount
//   admin.database().ref('/balance').once('value').then(snapshot => {
//     let oldBalance = snapshot.val()
//     let newBalance = oldBalance - withdrawAmount
//     admin.database().ref('/balance').set(newBalance).then(snapshot => {
//       console.log({
//         oldBalance,
//         withdrawAmount,
//         newBalance
//       })
//       res.send('success')
//     })
//   })
// })

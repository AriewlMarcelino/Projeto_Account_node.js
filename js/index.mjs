import inquirer from 'inquirer';
import fs from 'fs';
import chalk from 'chalk';

operation()

//Basic operations the system;
function operation(){
    inquirer
    .prompt([
        {
            name:'action',
            type:'list',
            message:'Bem vindo ao banco Acconuts, como podemos te ajudar?',
            choices:[
                'Criar conta',
                'Consultar saldo',
                'Depositar',
                'Sacar',
                'Sair'
            ],
        },
    ])
    .then((answer)=>{
        const action = answer['action']
        
        if(action === 'Criar conta'){
            createAccount();
        }
        else if(action === 'Consultar saldo'){
            getAccountBalance();
        }else if(action === 'Depositar'){
            deposit();
        }else if(action === 'Sacar'){
            withdraw();
        }else if(action === 'Sair'){
            console.log(chalk.bgBlue('Muito obrigado por usar o Accounts volte sempre!'))
        }
    })
    .catch((err) => console.log(err))
}

//create an account
function createAccount(){
    console.log(chalk.bgGreen.black('Parabéns por escolher este banco !'))
    console.log(chalk.green('Defina as opções da sua conta!'))

    buildAccount();
}

//buildAccount
function buildAccount(){
    inquirer
        .prompt([
            {
                name:'accountName',
                message:'Digite qual será o nome de sua conta?'
            }
        ]).then((answer)=>{
            const accountName = answer['accountName']
            console.info(accountName);

            //verify if exist the folder in the system;
            if(!fs.existsSync('accounts')){
                fs.mkdirSync('accounts')
            }

            //verify if user already exist
            if(fs.existsSync(`accounts/${accountName}.json`)){
                console.log(chalk.bgRed.black('Desculpe! mas esta conta já existe por faze escolha outro nome !'))
                //Let's call again the function, for user put your name again!
                buildAccount()
                return
            }

            //here let's create archive with name user register!
            fs.writeFileSync(`accounts/${accountName}.json`,
                '{"balance":0}',
                function(err){
                    console.log(err);
                },
            )
            console.log(chalk.green('Parabéns a sua conta foi criada com sucesso!'))
            operation()
        })
        .catch((err)=>console.log(err))
}

//Deposit amount in the account the client
function deposit(){
    inquirer
        .prompt([
            {
                name:'accountName',
                message:'Por favor digite a conta que deseja depositar o valor!'
            }
        ]).then((answer)=>{
            const accountName = answer['accountName']

            //Verify if account exists;
            if(!checkAccount(accountName)){
                return deposit();
            }

            // add to amount 
            inquirer
                .prompt([
                    {
                        name:'amount',
                        message:'Qual o valor que deseja depositar!'
                    }
                ])
                .then((answer)=>{
                    const amount = answer['amount']
                    addAmount(accountName, amount);
                    operation();
                })
                .catch((err)=>console.log(err))
        }).catch((err) => console.log(err))

}

//check if account exists;
function checkAccount(accountName){
    if(!fs.existsSync(`accounts/${accountName}.json`)){
        console.log(chalk.bgRed.black('Esta conta não existe,Por favor! Insira uma conat valida!'))
        return false
    }
    return true;
}

//function add amount in account;
function addAmount(accountName,amount){
    const account = getAccount(accountName);
    
    //validation the amount if cliente press "Enter"
    if(!amount){
        console.log(chalk.bgRed('Ocorreu um erro, tente mais tarde!'))
        return deposit();
    }

    //if client pass to amount true
    account.balance = parseFloat(amount) + parseFloat(account.balance)

    //Save the information in the archive!
    fs.writeFileSync(
        `accounts/${accountName}.json`,
        JSON.stringify(account),
        function(err){
            console.log(err);
        }
    )
    
    //massage operation is sucessfull
    console.log(chalk.green(`Operação concluida com sucesso o valor de R$${amount} foi depositada em sua conta!`))

}

//Function select we are archives in the system, for the deposit;
function getAccount(accountName){
    const accountsJson = fs.readFileSync(`accounts/${accountName}.json`,{
        encoding:'utf8',
        flag:'r'
    })

    return JSON.parse(accountsJson);
}

//Show account balance
function getAccountBalance(){
    inquirer
        .prompt([
        {
            name:'accountName',
            message:'Qual o seu nome da sua conta?',  
        }
    ]).then((answer)=>{

        const accountName = answer['accountName']

        //verify if account exists
        if(!checkAccount(accountName)){
            return getAccountBalance()
        }

        const account = getAccount(accountName);

        console.log(
            chalk.bgBlue(
                `Ola o saldo sua conta é de R$${account.balance} reis disponivél em conta!`
            ),
        )
        operation()
    })
    .catch((err)=> console.log(err))
}

//withdraw an amount from user account
function withdraw(){
    inquirer
        .prompt([
            {
                name:'AccountName',
                message:'Digite o nome de sua conta?'
            }
        ]).then((answer)=>{
            const accountName = answer['accountName'];

            if(!checkAccount(accountName)){
                return withdraw();
            }

            inquirer
                .prompt([
                    {
                        name:'amount',
                        message:'Qual o valor desejado para o saque?'
                    }
                ]).then((answer)=>{
                    const amount = answer['amount'];
                    removeAmount(accountName, amount);
                })
                .catch((err)=> console.log(err))

        }).catch((err)=> console.log(err));
}

function removeAmount(accountName,amount){
    const account = getAccount(accountName)

    if (!amount) {
        console.log(
            chalk.bgRed.black('Ocorreu um erro, tente novamente mais tarde!')
        )
        return withdraw();
    }

    if(account.balance < amount){
        console.log(chalk.bgRed.black('Desculpe! Mas este valor está indisponivél!'))
        return withdraw();
    }

    account.balance = parseFloat(account.balance) - parseFloat(amount)

    fs.writeFileSync(
        `accounts/${accountName}.json`,
        JSON.stringify(account),
        function(err){
        console.log(err)
        }
    )

    console.log(chalk.green(`O saque de R$ ${amount} reais foi retirado com sucesso !`))
    operation();


}



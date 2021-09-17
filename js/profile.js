function Person(name, age) {
    this.Pname = name;
    this.Page = age;

    this.changeName = function(newname) {
        this.Pname = newname;
        console.log(this);
    }
}

function DDD() {
    console.log(this);
}

function Person23(name, age) {
    this.Pname = name;
    this.Page = age;

    function changeName(newname) {
        this.Pname = newname;
    }
}

var person = new Person("dddd", 22);
person.changeName("323333");
DDD();
person.sex = "seddsssssss";
var person2 = new Person("dddd", 22);
var person2333 = new Person23("dddd", 22);
Person.prototype.sddddex = "ddss";




$(function() {
    userinfo = JSON.parse(localStorage.getItem("userInfo"));
    apiconf = JSON.parse(localStorage.getItem("apiconf"));
    $("#user-name").append(userinfo.name);
    $("#user-pwd").append(userinfo.password);
    $("#user-role").append(userinfo.roleid);
    $("#user-memo").append(userinfo.memo);
})
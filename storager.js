	class storager{

		static set(Obj_name,Obj){
			window.sessionStorage.setItem(Obj_name, JSON.stringify(Obj));
		}

		static get(Obj_name){
			Function.prototype.toJSON = Function.prototype.toString;
			let Obj = window.sessionStorage.getItem(Obj_name);
			let parser = function(k,v){return v.toString().indexOf('function') === 0 ? eval('('+v+')') : v};
			return JSON.parse(Obj,parser);
		}

		static check(Obj_name){
			if(window.sessionStorage.getItem(Obj_name)){
				return true;
			}else{
				return false;
			}
		}
		static delete(){
			window.sessionStorage.clear();
		}
	}

if (BABYLON.Engine.isSupported()) {
    var canvas = document.getElementById("canvas");
    var engine = new BABYLON.Engine(canvas, true);
    var divFps = document.getElementById("fps");

    var skeleton,newScene;


    //Use your file name at xxxxx
    BABYLON.SceneLoader.Load("3d/", "1.babylon", engine, function (newScene) {
        window.newScene=newScene;
        newScene.executeWhenReady(function () {

            //change the value of cameraFlag to a value other than 1 to use the free camera from blender
            var cameraFlag = 1;

            // which camera is active Arc Rotate or Blender Free Camera

            if (cameraFlag == 1){
                var myCamera = new BABYLON.ArcRotateCamera("ArcRotateCamera", 0, 0, 0, BABYLON.Vector3.Zero(), newScene);
                myCamera.setPosition(new BABYLON.Vector3(0, 3, -4));
                myCamera.speed = .1;
                myCamera.wheelPrecision = 250;
                myCamera.fov = .8;

                newScene.activeCamera = myCamera;

            }
            else {
                var myCamera2 = newScene.getCameraByName("Camera");
                myCamera2.speed = .1;
                myCamera2.wheelPrecision = 250;
                myCamera2.fov = .8;

                newScene.activeCamera = myCamera2;
            }


            //newScene.scale=new BABYLON.Vector3(0.1,0.1,0.1);
            console.log(newScene);

            // Then attach the activeCamera to the canvas.
            newScene.activeCamera.attachControl(canvas);
            newScene.clearColor=new BABYLON.Color4(0,0,0,0);



            //newScene.activeCamera.attachControl(canvas);
            var skeleton = newScene.getSkeletonById(0);
            window.skeleton=skeleton;
            //var myBone = skeleton.bones[28].name;
            //console.log(myBone);
            //change these parameters as necessary for start and end frames of animation, looping, and speed


            //newScene.beginAnimation(skeleton, 1, 11, true, 1);



            // Once the scene is loaded, just register a render loop to render it
            engine.runRenderLoop(function() {
                divFps.innerHTML = engine.getFps().toFixed() + " fps";
                newScene.render();
            });
        });
    }, function (progress) {
        // To do: give progress feedback to user
    });
}



var hitAnim=function(){
    newScene.beginAnimation(skeleton, 11, 21, false, 1, function(){
        newScene.beginAnimation(skeleton, 2, 11, true, 1);
    });
}

$(function(){
    $('.hit').click(hitAnim);
});

window.addEventListener("resize", function () {
    engine.resize();
});
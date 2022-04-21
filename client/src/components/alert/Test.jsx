import * as React from "react";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export default function Test({open, handleClose, type, text }) {

  return (
		<Stack
			spacing={1}
			sx={{ width: "100%" }}
		>
			<Snackbar
				open={open}
				autoHideDuration={2000}
				onClose={(e) => {
					handleClose(e);
				}}
        // anchorOrigin={{ vertical: "top", horizontal: "left" }}
        sx={{position:"absolute", top:"30px"}}
			>
				<Alert
					onClose={(e) => {
						handleClose(e);
					}}
					severity={type}
					sx={{ width: "100%" }}
				>
					{text}
				</Alert>
			</Snackbar>
		</Stack>
	);
}
